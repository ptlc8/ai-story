import Express from 'express';
import * as Story from './story.js';


const port = process.env.PORT ?? '80';

const app = Express();

app.use(Express.static('static'));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/{:hash}', (req, res) => {
    const hash = req.params.hash || '';
    const option = req.query.option;
    var stepPromise = option
        ? Story.getNextStep(hash, option)
        : Story.getStep(hash);
    stepPromise
        .then(step => {
            if (step)
                res.render('step', { step });
            else
                res.status(404).render('error', { message: 'Step not found' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).render('error', { message: 'Internal server error' });
        });
});

app.listen(port, err => {
    if (err) console.error(err);
    else console.log('HTTP server started');
});
