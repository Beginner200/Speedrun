import Phaser from 'phaser';
import { SaveService } from '../core/saveService';
import { button, card, homeButton, title, UI } from '../ui/uiStyle';
export class DailyScene extends Phaser.Scene {
 constructor(){super('DailyScene');}
 create():void{
  const {width,height}=this.scale; this.cameras.main.setBackgroundColor(UI.bg); const today=new Date().toISOString().slice(0,10),save=SaveService.load(),nextDay=Math.min(7,save.dailyReward.day+1);
  title(this,'DAILY REWARD',40); this.add.text(width/2,72,'7-DAY BONUS CALENDAR',{fontFamily:'Arial',fontSize:'11px',color:UI.muted,letterSpacing:2}).setOrigin(.5);
  for(let day=1;day<=7;day++){const y=125+(day-1)*61,claimed=day<=save.dailyReward.day,current=day===nextDay&&save.dailyReward.lastClaimDate!==today,reward=20+day*10;
   const c=card(this,width/2,y,width-30,50,current); this.add.text(32,y,''+day,{fontFamily:'Arial',fontSize:'18px',color:current?'#5ee7c4':'#ffffff',fontStyle:'bold'}).setOrigin(0,.5);
   this.add.text(61,y-8,day===7?'EXCLUSIVE SKIN':'COINS',{fontFamily:'Arial',fontSize:'11px',color:UI.muted,fontStyle:'bold'}); this.add.text(61,y+10,'+'+reward,{fontFamily:'Arial',fontSize:'14px',color:UI.gold,fontStyle:'bold'});
   this.add.text(width-28,y,claimed?'✓ CLAIMED':current?'CLAIM':'🔒',{fontFamily:'Arial',fontSize:'11px',color:claimed?'#5ee7c4':current?'#ffffff':UI.muted,fontStyle:'bold'}).setOrigin(1,.5);
   if(current)c.setInteractive({useHandCursor:true}).on('pointerup',()=>{SaveService.claimDailyReward(today);this.scene.restart();});
  }
  button(this,width/2,height-62,150,40,'◉ '+SaveService.load().coins+' COINS',UI.panel2,'#ffd166'); homeButton(this,()=>this.scene.start('HomeScene'));
 }
}