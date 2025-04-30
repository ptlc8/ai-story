import Express from 'express';
import * as Story from './story.js';


const port = process.env.PORT ?? '80';

const app = Express();

app.use(Express.static('static'));

app.set('view engine', 'ejs');
app.set('views', 'views');


// Story step route
app.get('/{:hash}', async (req, res) => {
    const hash = req.params.hash || '';
    const option = req.query.option;
    if (!option) {
        let step = await Story.getStep(hash);
        if (step)
            res.render('step', { step });
        else
            res.status(404).render('error', { message: 'Étape non trouvée' });
    } else {
        let step = await Story.getNextStep(hash, option);
        if (step)
           res.redirect(302, step.hash);
        else
            res.status(404).render('error', { message: 'Étape ou option non trouvé' });
    }
});


// Error handling
app.use((req, res, next) => {
    const origEnd = res.end;
    res.end = function (...args) {
        Promise.resolve()
            .then(() => origEnd.apply(res, args))
            .catch(next);
    };
    next();
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('error', { message: 'Erreur interne du serveur' });
});


// Start server
app.listen(port, err => {
    if (err) console.error(err);
    else console.log('HTTP server started');
});
