//导包
const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
// const cors = require("cors");
const multer = require("multer");

// 启动中间件的固定写法，并且上传文件夹的优化路径
const upload = multer({dest: path.join(__dirname, "uploads/")});
//启动服务器
const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.listen(3000, () => {
    console.log("服务器启动成功：http://127.0.0.1:3000")
});

//封装获取json文件的方法
function getJson(filePath = "account.json") {
    try {
        const getPath = path.join(__dirname, "/json/", filePath);
        return JSON.parse(fs.readFileSync(getPath));
    } catch (err) {
        console.log(err);
    }
}

// console.log(getJson("hero_info.json"));

//用户登录
app.post("/login", (req, res) => {
    const {username, password} = req.body;
    const account = getJson("account.json");
    const current = account.find(item => item.username === username);
    //当current不存在时，会返回undefined
    if (current) {
        if (current.password === password) {
            res.send({
                code: 200,
                msg: "登录成功"
            })
        } else {
            res.send({
                code: 400,
                msg: "密码错误"
            })
        }
    } else {
        res.send({
            code: 404,
            msg: "该账户不存在！"
        });

    }
});
//英雄列表
app.get("/list", (req, res) => {
    res.send({
        code: 200,
        msg: "获取成功",
        data: getJson("hero_info.json")
    })
});
//英雄新增
app.post("/add", upload.single("icon"), (req, res) => {
    const {name, skill} = req.body;
    // console.log(name);
    const reqFile = req.file;
    if (reqFile) {
        var {originalname} = reqFile;
    } else {
        return res.send({
            code: 404,
            msg: "图片或参数不能为空！"
        });
    }

    if (name && skill && originalname) {
        const herolist = getJson("hero_info.json");
        console.log(herolist);
        const newHero = {
            id: parseInt(herolist[herolist.length - 1].id) + 1,
            name,
            skill,
            icon: originalname
        };
        herolist.push(newHero);
        fs.writeFileSync(path.join(__dirname, "/json/hero_info.json"), JSON.stringify(herolist));
        res.send({
            code: 200,
            msg: "新增成功！"
        })
        // console.log(newHero);
    } else {
        res.send({
            code: 400,
            msg: "新增失败，任一参数不能为空"
        })
    }
});
//英雄删除
app.get("/delete", (req, res) => {
    const {id} = req.query;
    // console.log(id);
    const heroList = getJson("hero_info.json");
    const current = heroList.findIndex(item => item.id === parseInt(id));
    console.log(current);
    if (current !== -1) {
        heroList.splice(current, 1);
        fs.writeFileSync("./json/hero_info.json", JSON.stringify(heroList));
        res.send({
            code: 200,
            msg: "删除成功！"
        });
    } else {
        res.send({
            code: 400,
            msg: "未找到英雄，删除失败！"
        });
    }
});
//英雄查询
app.get("/search", (req, res) => {
    const id = req.query.id;
    const heroList = getJson("hero_info.json");
    const currentHero = heroList.filter(item => item.id === parseInt(id));
    if (currentHero.length) {
        res.send({
            code: 200,
            msg: "查询成功",
            data: {
                id,
                name: currentHero[0].name,
                skill: currentHero[0].skill,
                icon: currentHero[0].icon
            }
        })
    } else {
        res.send({
            code: 400,
            msg: "未找到该英雄"
        })
    }
});
//英雄编辑
app.post("/edit", upload.single("icon"), (req, res) => {
    const {id, name, skill} = req.body;
    const heroList = getJson("hero_info.json");
    if (req.file) {
        const {originalname} = req.file;
        if (id && name && skill) {
            const editHero = heroList.find(item => item.id === parseInt(id));
            if (editHero) {
                editHero.name = name;
                editHero.skill = skill;
                editHero.icon = originalname;
                fs.writeFileSync(path.join(__dirname, "/json/hero_info.json"), JSON.stringify(heroList));
                res.send({
                    code: 200,
                    msg: "修改成功"
                })
            } else {
                res.send({
                    code: 400,
                    msg: "参数错误！"
                })
            }
        } else {
            res.send({
                code: 400,
                msg: "参数不能为空！"
            })
        }
    } else {
        res.send({
            code: 400,
            msg: "头像不能为空！"
        })
    }

});


