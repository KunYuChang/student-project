const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose  = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./models/student");
const methodOverride = require('method-override');
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");
mongoose.set('useFindAndModify', false);

// DB
mongoose
    .connect("mongodb://localhost:27017/studentDB", {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB,");
    })
    .catch( err => {
        console.log("Connection Failed.");
        console.log(err);
    });

// Routing
app.get("/", (req, res) => {
    res.render("index.ejs")
});

// 對資料庫撈資料
app.get("/students/", async (req, res) => {
    let data = await Student.find();
    res.render("showStudents.ejs", {data})
});

// 輸入頁面
app.get("/students/insert", (req, res) => {
    res.render("studentInsert.ejs")
});

// 學生個人頁面
app.get("/students/:id", async (req, res) => {
    let {id} = req.params;
    try {
        // 用find回傳array;findOne回傳object
        // 這邊有一個細節，當我們使用mongoose findOne "找不到的情況下"，事實上並不會進入catch，
        // 用console.log(data)可以知道，如果找不到，會回傳null，那麼就可以來做處理了!
        let data = await Student.findOne({id}) 
        if (data !== null) {
            res.render("studentPage.ejs", {data})
        } else {
            res.send("找不到這個學生，請輸入正確的ID。")
        }           
    } catch (e) {
        // Student model 如果有問題，catch 會抓到。(例如沒有引入)
        res.send("Error!!");
        console.log(e);
    }
});


app.post("/students/insert", (req, res) => {
    let { id, name, age, merit, other} = req.body // 解構提領出from表單submit過來的資訊
    let newStudent = new Student({id, name, schlarship: {merit, other}}) // Shorthand Property

    // 儲存到資料庫
    newStudent
    .save()
    .then(() => {
        console.log("學生資訊已存入資料庫");
        res.render("success.ejs");
    })
    .catch((error) => {
        console.log("學生資訊儲存失敗");
        console.log(error)
        res.render("reject.ejs");
    })
})

// 更新學生資料
app.get("/students/edit/:id", async (req, res)=>{
    let {id} = req.params;
    try {
        let data = await Student.findOne({id});
        if (data !== null) {            
            res.render("edit.ejs", {data});
        } else {
            res.send("找不到這個學生，請輸入正確的ID。")
        }
    } catch (e) {
        console.log(e)
        res.send("更新發生錯誤!!");
    }
})

// 處理更新學生資料PUT
app.put("/students/edit/:id", async (req, res) => {
    // let {id} = req.params; 衝突不使用
    let {id, name, age, merit, other} = req.body;
    try {
        let d = await Student.findOneAndUpdate(
            {id}, 
            {id, name, age, merit, schlarship:{merit, other}}, // 由於 form 回傳回來的 object 是merit & other，因此要做個調整(寫上schlarship)
            {
                new: true,
                runValidators: true
            }
        )
        res.redirect(`/students/${id}`)
    } catch {
        res.render("reject.ejs");
    }
})

// 刪除學生資料
app.get("/students/delete/:id", async (req, res)=>{
    let {id} = req.params;
    try {
        let data = await Student.findOne({id});
        if (data !== null) {            
            res.render("delete.ejs", {data});
        } else {
            res.send("找不到這個學生，請輸入正確的ID。")
        }
    } catch (e) {
        console.log(e)
        res.send("更新發生錯誤!!");
    }
})

// 刪除學生資料
app.delete("/students/delete/:id", async (req, res) => {
    let {id} = req.params;
    console.log(id);
    try {
        let d = await Student.deleteOne({id})
        console.log("刪除成功");
        res.redirect("/students/");
    } catch {
        console.log("刪除成功");
        res.redirect("/students/");
    }
})


// 404
app.get("/*", (req, res) => {
    res.status(404);
    res.send("Not allowed");
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}.`)
})