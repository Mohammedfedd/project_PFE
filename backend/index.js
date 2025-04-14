import  express from "express"
import dotenv from 'dotenv'

dotenv.config();
const app = express()

const port=<process className="env PORT"></process>;

app.get('/',(req,res)=>{
    res.send("charlie brown had no hoes")
})

app.listen(5000,()=>{
    console.log(`server is running on http://localhost:${port}`);
});