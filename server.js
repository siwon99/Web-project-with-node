const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')
app.use(express.json()) //유저가 데이터 보내고 쓰는 코드 쉽게 해줌
app.use(express.urlencoded({extended:true})) //유저가 데이터 보내고 쓰는 코드 쉽게 해줌

const { MongoClient, ObjectId } = require('mongodb')

let db
const url = 'mongodb+srv://kimsiwon0707:kdongw0619*@cluster0.ms4oseb.mongodb.net/?retryWrites=true&w=majority'
new MongoClient(url).connect().then((client) => {
  console.log('DB연결성공')
  db = client.db('node')

  app.listen(8080, () => {
    console.log('http://localhost:8080에서 서버 실행중')
  })

}).catch((err) => {
  console.log(err)
})

app.get('/list', async(요청, 응답) => {
  let result = await db.collection('post').find().toArray()
  console.log(result)
  응답.render('list.ejs', { posts: result })
})

app.get('/write', (요청, 응답) => {
  응답.render('write.ejs')
})

app.post('/add', async(요청, 응답) => {
  try {
    if (요청.body.title == '') {
      응답.send('ERROR: 제목 입력하시오!')
    } else {
      await db.collection('post').insertOne({title: 요청.body.title, content: 요청.body.content})
      응답.redirect('/list')
    }
  } catch(e) {
    console.log(e) //에러 메시지 출력
      응답.status(500).send('서버 에러')
  }
})

app.get('/detail/:id', async (요청, 응답) => {
  try {
    let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id)})
    console.log(요청.params)
    if(result == null) {
      응답.status(400).send('이상한 url 입력금지')
    }
    응답.render('detail.ejs', { result : result})
  } catch(e) {
    console.log(e)
    응답.status(400).send('이상한 url 입력금지')
  }
})

app.get('/edit/:id', async (요청, 응답) => {
  let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id)})
  console.log(result)
  응답.render('edit.ejs', {result : result})
})

app.post('/edit', async (요청, 응답)=>{
  try {
    await db.collection('post').updateOne({ _id : new ObjectId(요청.body.id) },
      {$set : { title : 요청.body.title, content : 요청.body.content }
    })
    응답.redirect('/list')
  } catch(e) {
    응답.status(400).send('Error! 내용채우기')
  }
}) 