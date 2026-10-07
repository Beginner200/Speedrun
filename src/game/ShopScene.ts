import Phaser from 'phaser';
import { SaveService, SKINS } from '../core/saveService';
import { card, homeButton, title, UI } from '../ui/uiStyle';
export class ShopScene extends Phaser.Scene {
  constructor(){super('ShopScene');}
  create():void{
    const {width,height}=this.scale; this.cameras.main.setBackgroundColor(UI.bg); title(this,'SHOP',42);
    this.add.text(width-18,48,'◉ '+SaveService.load().coins,{fontFamily:'Arial',fontSize:'18px',color:'#ffd166',fontStyle:'bold'}).setOrigin(1,.5);
    this.add.text(width/2,74,'COSMETIC SKINS',{fontFamily:'Arial',fontSize:'12px',color:UI.muted,letterSpacing:2}).setOrigin(.5);
    const preview=card(this,width/2,122,112,72,true); preview.setStrokeStyle(2,UI.gold,.8);
    this.add.text(width/2,122,'★  COLLECTION',{fontFamily:'Arial',fontSize:'12px',color:'#ffffff',fontStyle:'bold'}).setOrigin(.5);
    const startY=180,rowH=64;
    SKINS.forEach((skin,index)=>{
      const y=startY+index*rowH,data=SaveService.load(),owned=data.ownedSkins.includes(skin.id),selected=data.selectedSkin===skin.id;
      const c=card(this,width/2,y,width-30,54,selected).setInteractive({useHandCursor:true});
      this.add.rectangle(43,y,32,38,skin.color).setStrokeStyle(2,0xffffff,.7);
      this.add.text(66,y-10,skin.name,{fontFamily:'Arial',fontSize:'15px',color:'#ffffff',fontStyle:'bold'});
      this.add.text(66,y+11,owned?(selected?'EQUIPPED':'OWNED'):'LOCKED',{fontFamily:'Arial',fontSize:'10px',color:selected?'#5ee7c4':UI.muted,fontStyle:'bold'});
      this.add.text(width-28,y,selected?'✓':owned?'EQUIP':'🔒 '+skin.price,{fontFamily:'Arial',fontSize:'12px',color:selected?'#5ee7c4':'#ffffff',fontStyle:'bold'}).setOrigin(1,.5);
      c.on('pointerdown',()=>this.tweens.add({targets:c,scaleX:.98,scaleY:.98,duration:60}));
      c.on('pointerup',()=>{this.tweens.add({targets:c,scaleX:1,scaleY:1,duration:80});const result=SaveService.buyOrSelectSkin(skin.id);if(result.ok)this.scene.restart();});
    });
    homeButton(this,()=>this.scene.start('HomeScene'));
  }
}