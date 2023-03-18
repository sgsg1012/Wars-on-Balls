export class AcGame {
    constructor(id,acwing_os){
        // console.log('create ac game')
        this.id=id;
        this.acwing_os=acwing_os;
        this.$ac_game=$('#'+this.id);
        this.settings=new Settings(this);
        this.menu=new AcGameMenu(this);
        this.playground=new AcGamePlayground(this);
    }
}