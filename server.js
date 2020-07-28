'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const methodOverride = require('method-override');
const pg = require('pg');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 2000;
const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.get('/', homeHandler);
function homeHandler(req, res) {
    let url = 'https://official-joke-api.appspot.com/jokes/programming/ten';
    superagent.get(url)
        .then((val) => {
            let arrUrl = val.body.map(datas => {
                return new Jokes(datas);
            })
            res.render('index', { data: arrUrl });
        })
}

app.get('/rand', randHandler);
function randHandler(req, res) {
    let url = 'https://official-joke-api.appspot.com/jokes/programming/randomn';
    superagent.get(url)
        .then((val) => {
            let arrUrl = val.body.map(datas => {
                return new Jokes(datas);
            })
            res.render('index', { data1: arrUrl });
        })
}

function Jokes(datas) {
    this.type = datas.type || 'no type';
    this.setup = datas.setup || 'no setup';
    this.punchline = datas.punchline || 'no punchline';
}

app.get('/addToDb', addToDbHandler);
function addToDbHandler(req, res) {
    let {type, setup, punchline}=req.body;
    let sql = 'INSERT INTO joketb (type,setup,punchline)VALUES($1,$2,$3);';
    let safaVals = [type, setup, punchline];
    client.query(sql, safaVals)
        .then(() => {
            res.redirect('/selectData');
        })
}
app.get('/selectData', selectHandler);
function selectHandler(req, res) {
    let sql = 'SELECT * FROM joketb;';
    client.query(sql)
        .then((val) => {
            res.render('pages/favorite', { data: val.rows })
        })
}
app.put('/update/:up_id',updateHandler);
function updateHandler(req,res){
    let param=req.params.up_id;
    let {type,setup,punchline}=req.body;
    let sql='UPDATE joketb SET type=$1,setup=$2,punchline=$3 WHERE id=$4;';
    let safavals=[type,setup,punchline,param];
    client.query(sql,safavals)
    .then(()=>{
res.redirect(`/update/${param}`);
    })
}

app.delete('/delete/:del_id',delHandler);
function delHandler(req,res){
    let param=req.body.del_id;
    let  sql =' DELETE joketb WHERE id=$1;';
    let safVal=[param];
    client.query(sql,safVal)
    .then(()=>{
        res.redirect('/selectData');
    })
}
client.connect()
    .then(() => {
        app.listen(PORT, console.log(`up & run on port ${PORT}`));
    })

function notFoundHandler(req, res) {
    res.status(404).send('Not Found 404');
}

function errorHandler(err, req, res) {
    res.status(500).send(err);
}
app.use('*', notFoundHandler);