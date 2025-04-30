import crypto from 'crypto';
import { queryDatabase } from './database.js';
import { complete } from './mistral-llm.js';

import 'dotenv/config';


export async function getStep(hash) {
    let rows = await queryDatabase('SELECT Step.description, hash, previous_step_hash, Option.description AS option FROM Step LEFT JOIN Option ON step_hash = hash WHERE hash = $1 ORDER BY index', [hash]);
    if (rows.length == 0)
        return null;
    let step = rows.reduce((step, row) => step.options.push(row.option) && step, { ...rows[0], options: [] });
    return step;
}


export async function getNextStep(hash, optionIndex) {
    let nextHash = hashStep(hash, optionIndex);
    let nextStep = await getStep(nextHash);
    if (nextStep)
        return nextStep;
    let step = await getStep(hash);
    if (!step || !step.options[optionIndex])
        return null;
    let generatedStep = await generateNextStep(step.description, step.context, step.options[optionIndex]);
    generatedStep.hash = nextHash;
    generatedStep.previous_step_hash = hash;
    await queryDatabase('INSERT INTO Step (hash, previous_step_hash, description, context) VALUES ($1, $2, $3, $4)', [nextHash, hash, generatedStep.description, generatedStep.context]);
    generatedStep.options.forEach(async (option, index) => {
        await queryDatabase('INSERT INTO Option (index, step_hash, description) VALUES ($1, $2, $3)', [index, nextHash, option]);
    });
    return generatedStep;
}


function hashStep(previousStepHash, optionIndex) {
    const raw = `${previousStepHash}|${optionIndex}`;
    return crypto.createHash('md5').update(raw).digest('hex');
}


async function generateNextStep(description, context, optionDescription) {
    let prompt = `Tu es le maitre du jeu, tu donnes des explications courtes et donne des propositions
Voici les infos retenus : "${context}"
"${description}"
L'utilisateur a choisi : "${optionDescription}"
Tu repondras avec cette forme :
une explication
---
des propositions (une par ligne)
---
éventuellement des infos à retenir pour la suite de l'histoire ou le mot rien`;
    while (true) {
        let response = await complete(prompt);
        let parts = response.split(/\W*\n---\n\W*/);
        if (parts.length < 2)
            continue;
        return {
            description: parts[0],
            options: parts[1].split('\n'),
            context: parts[2]
        }
    }
}
