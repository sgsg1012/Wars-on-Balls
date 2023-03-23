let AC_GAME_OBJECTS = [];
class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);
        this.has_called_start=false; // 是否执行过start函数
        this.timedelta=0; // 帧与帧的时间差
        this.uuid = this.create_uuid(); // 8位数的uuid
    }
    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  // 返回[0, 10)之间的数
            res += x;
        }
        return res;
    }
    start(){ // 只会在第一帧执行一次

    }
    update(){ // 每一帧都会被执行

    }
    on_destroy(){ // 被销毁前执行

    }
    destroy(){ // 销毁 js中，一个对象没有被任何变量保存会自动销毁
        this.on_destroy();
        for(let i=0;i<AC_GAME_OBJECTS.length;i++)
        {
            if(AC_GAME_OBJECTS[i]===this)
            {
                AC_GAME_OBJECTS.splice(i,1);
                break;
            }
        }
    }
}

// 实现每一帧执行update函数
let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp){
    for(let i=0;i<AC_GAME_OBJECTS.length;i++){
        let obj=AC_GAME_OBJECTS[i];
        if(!obj.has_called_start){
            obj.start();
            obj.has_called_start=true;
        }else{
            obj.update();
            obj.timedelta=timestamp-last_timestamp;
        }
    }
    last_timestamp=timestamp;
    // 这一帧执行完之后，递归调用执行下一帧
    requestAnimationFrame(AC_GAME_ANIMATION);
}

// 该函数会在每一帧执行传入的参数函数
requestAnimationFrame(AC_GAME_ANIMATION);