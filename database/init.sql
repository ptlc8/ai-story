-- Création de la table "Step"
CREATE TABLE IF NOT EXISTS Step (
    hash VARCHAR(32) PRIMARY KEY, -- Le hash MD5 (32 caractères) pour identifier l'étape
    previous_step_hash VARCHAR(32), -- Le hash du step précédent, nullable
    description TEXT, -- La description de l'étape
    context TEXT, -- Le contexte de l'étape
    FOREIGN KEY (previous_step_hash) REFERENCES Step(hash) -- Clé étrangère vers la table "Step" pour relier les étapes
);

-- Création de la table "Option"
CREATE TABLE IF NOT EXISTS Option (
    step_hash VARCHAR(32), -- Le hash de l'étape associé
    description TEXT, -- Le texte associé à l'option
    FOREIGN KEY (step_hash) REFERENCES Step(hash) -- Clé étrangère vers la table "Step"
);

-- Insertion d'une étape de base avec un hash vide
INSERT INTO Step (hash, previous_step_hash, description, context)
VALUES
    ('', NULL, 'Vous vous réveillez sur une plage inconnue.
Le sable est tiède sous vos doigts. Le vent salé vous caresse le visage.
À l''horizon, l''océan s''étend à perte de vue. Derrière vous, une jungle dense murmure doucement.', '');

INSERT INTO Option (step_hash, description) VALUES
    ('', 'Je me lève et observe les alentours'),
    ('', 'Je m''enfonce prudemment dans la jungle'),
    ('', 'Je longe la plage à la recherche de traces ou d''abris'),
    ('', 'Je ramasse ce que je trouve sur la plage pour m''équiper');
