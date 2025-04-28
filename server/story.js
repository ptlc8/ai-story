import crypto from 'crypto';
import { Client as PgClient } from 'pg';
import { complete } from './mistral-llm.js';

import 'dotenv/config';


function withDatabase(f) {
    const client = new PgClient({
        host: process.env.POSTGRES_HOSTNAME,
        port: 5432,
        user: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_USERNAME
    });
    return client.connect()
        .then(() => f(client))
        .finally(() => client.end());
}


export async function getStep(hash) {
    let step;
    await withDatabase(async client => {
        let result = await client.query('SELECT Step.description, hash, previous_step_hash, Option.description AS option FROM Step LEFT JOIN Option ON step_hash = hash WHERE hash = $1', [hash]);
        if (result.rows.length == 0) {
            step = null
        } else {
            step = result.rows.reduce((step, row) => step.options.push(row.option) && step, { ...result.rows[0], options: [] });
        }
    });
    return step;
}


export async function getNextStep(hash, optionIndex) {

}


function hashStep(previousStepHash, option) {
    const raw = `${previousStepHash}|${option}`;
    return crypto.createHash('md5').update(raw).digest('hex');
}


`Tu es le maitre du jeu, tu donnes des explications courtes et donne des propositions
Voici les infos retenus : "Infos à retenir : une crique abritée est visible, la mer est calme, une mouette est présente"
"Vous scrutez l’horizon, mais il n’y a ni cabane, ni fumée, ni trace humaine. En longeant la plage vers les rochers, vous remarquez une petite crique partiellement abritée par une paroi rocheuse. Cela pourrait faire un bon abri temporaire. Une mouette vous survole en criant."
L'utilisateur a choisi : "Rester sur la plage et attendre un éventuel secours"
Tu repondras avec cette forme :
une explication
---
des propositions (une par ligne)
---
éventuellement des infos à retenir pour la suite de l'histoire ou le mot rien`
