const express = require('express');
const port = process.env.PORT || 3000;
const app = express();
const { ZingMp3 } = require("zingmp3-api-full");
const bodyParser = require("body-parser");
const pool = require("./dbconnection");
const mylib = require("./mylib");

app.use(bodyParser.raw({inflate:true,type:'application/json'}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/regist', (req,res) => {
    const body = JSON.parse(req.body);
    pool.query("SELECT * FROM user WHERE username = ?",[body.username],(err,resGet)=>{
        if(err) throw err;
        if(resGet.length!=0){
            return res.json({
                error:true,
                message:"Tài khoản này đã tồn tại"
            });
        }
        pool.query("INSERT INTO user VALUES (?,?,?)",
            [body.username,Buffer.from(body.password + process.env.SALT_PASSWORD).toString('base64'),body.fullname]
            ,(errIns,resIns)=>{
            if(errIns) throw errIns;
            return res.json({
                error:false,
                message:"Đăng ký thành công"
            });
        });
    });
});

app.post('/login',(req,res)=>{
    const body = JSON.parse(req.body);
    pool.query("SELECT * FROM user WHERE username = ? AND password = ?",
        [body.username,Buffer.from(body.password+process.env.SALT_PASSWORD).toString('base64')],
        (errGet,resGet)=>{
            if(errGet) throw errGet;
            if(resGet.length==0){
                return res.json({
                    error:true,
                    message:"Sai thông tin đăng nhập"
                });
            } else {
                const row = mylib.parseToJSONFrDB(resGet)[0];
                return res.json({
                    error:false,
                    message:"Đăng nhập thành công",
                    data: {
                        fullName:row.fullname,
                        accessToken:mylib.generAccessTokenUser(row.username)
                    }
                });
            }
    });
});

app.get('/search', (req, res) => {
    try {
        const header = req.headers;
        // const authState = mylib.verifyAuthorizationUser(header.accessToken.split(' ')[1]);
        // const user = authState.data.username;
        // pool.query("SELECT * FROM recommend WHERE username = ?",[user],(err))
        const qs = req.query;
        const stringSearch = qs.string_search;
        ZingMp3.search(stringSearch).then((data)=>{
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (err){
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_banner',(req,res)=>{
    ZingMp3.getHome().then((data) => {
        const dataBanner = JSON.parse(JSON.stringify(data)).data.items[0].items;
        res.json({
            error:false,
            message:"Success",
            data:dataBanner
        });
    });
});

app.get('/get_home',(req,res)=>{
    try {
        ZingMp3.getHome().then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:JSON.parse(JSON.stringify(data)).data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_song',(req,res)=>{
    try {
        const qs = req.query;
        const id = qs.id;
        ZingMp3.getSong(id).then((data) => {
            console.log(data);
            const dataSong = {
                "128": (data.data['128']=='VIP')?null:data.data['128'],
                "320": (data.data['320']=='VIP')?null:data.data['320']
            };
            res.json({
                error:false,
                message:"Success",
                data:dataSong
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_new_release',(req,res)=>{
    ZingMp3.getHome().then((data) => {
        res.json({
            error:false,
            message:"Success",
            data:JSON.parse(JSON.stringify(data)).data.items[3].items
        });
    });
});

app.get('/get_detail_playlist',(req,res)=>{
    try {
        const qs = req.query;
        const id = qs.id;
        ZingMp3.getDetailPlaylist(id).then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_top_100',(req,res)=>{
    try {
        ZingMp3.getTop100().then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_chart_home',(req,res)=>{
    try {
        ZingMp3.getChartHome().then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data.RTChart.items
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_new_release_chart',(req,res)=>{
    try {
        ZingMp3.getNewReleaseChart().then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data.items
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    } 
});

app.get('/get_inf_song',(req,res)=>{
    try {
        const qs = req.query;
        const id = qs.id;
        ZingMp3.getInfoSong(id).then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_hot_artist',(req,res)=>{
    ZingMp3.getHome().then((data) => {
        res.json({
            error:false,
            message:"Success",
            data:JSON.parse(JSON.stringify(data)).data.items[5].items
        });
    });
});

app.get('/get_artist',(req,res)=>{
    try {
        const qs = req.query;
        const name = qs.name;
        ZingMp3.getArtist(name).then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_list_song_artist',(req,res)=>{
    try {
        const qs = req.query;
        const id = qs.id;
        const page = qs.page;
        const count = qs.count;
        ZingMp3.getListArtistSong(id,page,count).then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_lyric',(req,res)=>{
    try {
        const qs = req.query;
        const id = qs.id;
        ZingMp3.getLyric(id).then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_list_mv',(req,res)=>{
    try {
        const qs = req.query;
        const id = qs.id;
        const page = qs.page;
        const count = qs.count;
        ZingMp3.getListMV(id,page,count).then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_category_mv',(req,res)=>{
    try {
        const qs = req.query;
        const id = qs.id;
        ZingMp3.getCategoryMV(id).then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.get('/get_video_mv',(req,res)=>{
    try {
        const qs = req.query;
        const id = qs.id;
        ZingMp3.getVideo(id).then((data) => {
            res.json({
                error:false,
                message:"Success",
                data:data.data
            });
        });
    } catch (error) {
        res.json({
            error:true,
            message:"Có lỗi xảy ra",
        });
    }
});

app.listen(port, () => console.log('Server is running on port '+port));