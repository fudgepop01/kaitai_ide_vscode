import{f as t,r as i,c as s,h as e}from"./p-3ce56d6b.js";var n;(function(t){t[t["ASCII"]=0]="ASCII";t[t["BYTE"]=1]="BYTE";t[t["BIT"]=2]="BIT"})(n||(n={}));var h;(function(t){t[t["ASCII"]=0]="ASCII";t[t["BYTE"]=1]="BYTE";t[t["INTEGER"]=2]="INTEGER";t[t["FLOAT"]=3]="FLOAT"})(h||(h={}));var o;(function(t){t["DOT"]="•";t["CROSS"]="╳";t["FULL_BLOCK"]="█";t["LIGHT_SHADE"]="░";t["MEDIUM_SHADE"]="▒";t["DARK_SHADE"]="▓";t["DASH"]="-";t["PLUS"]="+"})(o||(o={}));function l(t){if(t instanceof f)return true;else return false}function r(t){if(t.length>0)return t[t.length-1];return undefined}class a{constructor(t,i,s=0,e){this.offset=t;this.length=i;this.modified=s;this.myType=e;this.self=this}splitAt(t){const i=this.makeNew(this.mOffset,t);const s=this.makeNew(this.offset+t,this.length-t,this.modified);if(i.length===0){this.self=[s];return[undefined,s]}if(s.mLength===0){this.self=[i];return[i,undefined]}return this.self=[i,s]}isContinuedBy(t){if(t instanceof this.myType){return this.mLength+this.mOffset===t.mOffset&&this.editNum===t.editNum}return false}join(t){return this.self=this.makeNew(this.mOffset,this.mLength+t.mLength)}get isSelf(){return this===this.self}get mOffset(){return this.offset+this.modified}get mLength(){return this.length-this.modified}get pieces(){if(Array.isArray(this.self)){if(this.self.length===1)return[...this.self[0].pieces];return[...this.self[0].pieces,...this.self[1].pieces]}return[this.self]}}class c extends a{constructor(t,i,s=0){super(t,i,s,c)}makeNew(t,i,s){return new c(t,i,s)}}class d extends a{constructor(t,i,s,e,n=[],h=0){super(t,i,h,d);this.type=s;this.editNum=e;this.consumption=n}makeNew(t,i,s){return new d(t,i,this.type,this.editNum,this.consumption,s)}}class f{constructor(t,i,s,e){this.offset=t;this.type=i;this.editNum=s;this.index=e;this.content=[];this.consumption=[]}get length(){return this.content.length}get modified(){return 0}get mLength(){return this.length}get mOffset(){return this.offset}get pieces(){return[this]}}class u{constructor(t){this.parent=t;this.added=new Uint8Array;this.pieces=[];this.undoStack=[];this.redoStack=[];this.chunk="";this.original=t.file;this.pieces=[new c(0,this.original.length)];window["rollback"]=()=>{this.rollback();console.log(this.pieces)};window["ec"]=this}initEdit(t,i){if(this.redoStack.length>0)this.rollback();this.inProgress=new f(this.added.length,i,this.undoStack.length+1,-1);let{targetIndex:s,targetSlicePoint:e,target:n}=this.getPieceAtOffset(t);if(n instanceof a){const t=n.splitAt(e);let i;if(!t[0]){this.inProgress.index=s;i=[this.inProgress,t[1]]}else if(!t[1]){this.inProgress.index=s+1;i=[t[0],this.inProgress]}else{this.inProgress.index=s+1;i=[t[0],this.inProgress,t[1]]}this.pieces.splice(s,1,...i)}this.undoStack.push(this.inProgress)}getPieceAtOffset(t){let i=0;let s;let e;let n;for(const[h,o]of this.pieces.entries()){i+=o.mLength;if(i>=t){s=o.mLength-i+t;e=h;n=o;break}}return{targetSlicePoint:s,targetIndex:e,target:n}}get isInProgress(){return!!this.inProgress}modifyNextPiece(t,i,s){const e=s?s:this.inProgress;if(i!==this.pieces.length-1){let s=r(e.consumption);if(s===undefined||s.consumed){const t=this.pieces[i+1];s={consumed:false,piece:t,startMod:t.modified};e.consumption.push(s)}s.piece.modified-=t;if(s.piece.mLength===0){s.consumed=true;this.pieces.splice(i+1,1)}}}find(t,i,s){const e=[];let n=this.render(i,s?s:this.length-i).out;let h=0;for(let s=t.length;s<n.length;s++){if(n[s]===t[t.length-1]){for(let h=t.length-1;h>=0;h--){if(h===0){e.push(s+i-t.length+1);break}if(n[s-(t.length-h)]!==t[h-1]){s+=h-1;break}}}else{const i=t.lastIndexOf(n[s]);if(i===-1)s+=t.length-1;else{s+=t.length-i-2}}h++;if(h>1e5)break}return e}redo(){if(this.redoStack.length>0){const[i,s,e]=this.redoStack.pop();const n=this.pieces.indexOf(i);if(e.type==="insert"){this.pieces.splice(n,0,...e.pieces)}else{let t=0;let i=r(e.consumption);if(!i.consumed)t=1;if(!isNaN(s)){if(!i.piece.isSelf){i.piece.pieces[0].modified=s}else{i.piece.modified=s}}this.pieces.splice(n,e.consumption.length-t,...e.pieces)}this.undoStack.push(e);t(this.parent)}}undo(){if(this.isInProgress){this.commit();this.chunk=""}if(this.undoStack.length>0){const i=this.undoStack.pop();const s=this.pieces.indexOf(i.pieces[0]);let e;let n=NaN;if(i instanceof d&&i.type==="overwrite"){const t=[];const h=[];for(const s of i.consumption){if(s.consumed){s.piece.modified=s.startMod;t.push(s.piece)}else{h.push(s)}}this.pieces.splice(s,i.pieces.length,...t);e=this.pieces[s];if(h.length){if(!h[0].piece.isSelf){const t=h[0].piece.pieces;n=t[0].modified;t[0].modified=h[0].startMod-h[0].piece.modified}else{n=h[0].piece.modified;h[0].piece.modified=h[0].startMod}}}else{this.pieces.splice(s,i.pieces.length);e=this.pieces[s]}this.redoStack.push([e,n,i]);t(this.parent)}}backSpace(){if(this.inProgress){this.chunk="";this.inProgress.content.pop();this.parent.setCursorPosition(this.parent.cursor-1);this.modifyNextPiece(1,this.inProgress.index)}}buildEdit(i){if(!this.parent.cursor||this.parent.cursor===-1)return;if(i.key==="Z"&&(i.metaKey||i.ctrlKey)){this.redo();return}if(i.key==="z"&&(i.metaKey||i.ctrlKey)){this.undo();return}if(i.key==="Backspace"){this.backSpace();return}if([n.ASCII,n.BYTE].includes(this.parent.editingMode)){if(!this.isInProgress)this.initEdit(this.parent.cursor,this.parent.editType);if(this.parent.editingMode===n.ASCII&&i.key.length===1&&/[\u0000-\u00FF]/.test(i.key)){this.inProgress.content.push(i.key.charCodeAt(0));this.parent.setCursorPosition(this.parent.cursor+1);if(this.inProgress.type==="overwrite")this.modifyNextPiece(-1,this.inProgress.index)}else if(this.parent.editingMode===n.BYTE&&/^[a-fA-F0-9]$/.test(i.key)){this.chunk+=i.key;if(this.chunk.length===2){this.inProgress.content.push(parseInt(this.chunk,16));this.chunk="";this.parent.setCursorPosition(this.parent.cursor+1);if(this.inProgress.type==="overwrite")this.modifyNextPiece(-1,this.inProgress.index)}}}else if(this.parent.editingMode===n.BIT&&["0","1","Enter"].includes(i.key)){if(i.key==="Enter"){this.initEdit(this.parent.cursor,"insert");this.inProgress.content.push(0);this.commit();t(this.parent)}else{if(!this.isInProgress)this.initEdit(this.parent.cursor,"overwrite");this.parent.setCursorPosition(this.parent.cursor,this.parent.bit+1)}}}commit(){const t=new Uint8Array(this.added.length+this.inProgress.content.length);t.set(this.added,0);t.set(this.inProgress.content,this.added.length);const i=new d(t.length-this.inProgress.length,this.inProgress.length,this.inProgress.type,this.inProgress.editNum,this.inProgress.consumption);this.pieces[this.inProgress.index]=i;this.undoStack[this.undoStack.length-1]=i;this.added=t;this.inProgress=null;this.chunk=""}rollback(){let t=0;while(this.redoStack.length>0){t+=this.redoStack.pop()[2].length}let i=new Uint8Array(this.added.length-t);i.set(this.added.subarray(0,i.length),0);this.added=i;for(let t=0;t<this.pieces.length-1;t++){const i=this.pieces[t];const s=this.pieces[t+1];if(i.isContinuedBy(s)){this.pieces.splice(t,2,i.join(s));t--}}}render(t,i){let s=new Uint8Array(i);let e={added:[]};let n=0;let h;let o=0;for(const[i,s]of this.pieces.entries()){n+=s.mLength;if(n>=t){h=s.mLength-n+t;o=i;break}}if(l(this.pieces[o])||this.pieces[o]instanceof d){e.added.push([t-h,t-h+this.pieces[o].length])}let r=this.getPieceBuffer(this.pieces[o]).subarray(h,h+i);n=r.length;s.set(r,0);for(let h=o+1;h<this.pieces.length;h++){let o=this.pieces[h];n+=o.mLength;if(l(o)||o instanceof d){e.added.push([t+n-o.mLength,t+n])}if(n>=i){s.set(this.getPieceBuffer(o).subarray(0,o.mLength-n+i),n-o.mLength);break}s.set(this.getPieceBuffer(o),n-o.mLength)}if(n!==i){return{out:s.subarray(0,n),meta:e}}return{out:s,meta:e}}get length(){let t=0;for(const i of this.pieces){t+=i.length}return t}save(){return this.render(0,this.length).out}getPieceBuffer(t){if(l(t)){return new Uint8Array(t.content)}if(t instanceof c){return this.original.subarray(t.mOffset,t.mOffset+t.mLength)}else{return this.added.subarray(t.mOffset,t.mOffset+t.mLength)}}}function p(t,i,s){let e;switch(i){case 1:e=4;break;case 2:e=5;break;case 4:e=8;break;case 8:e=11;break;default:return}let n=t<0?1:0;t=Math.abs(t);let h=Math.floor(t);let o=t-h;let l=i*8-1-e-h.toString(2).length+3;let r="";for(let t=0;t<l;t++){o*=2;r+=Math.floor(o);if(o>=1)o-=1}let a=r.substring(r.length-2);r=r.substring(0,r.length-2);console.log(r,a);if(a.charAt(0)==="1"){r=(parseInt(r,2)+1).toString(2);if(/^10+$/.test(r)){h+=1;r=""}}let c=h.toString(2).length-1+(Math.pow(2,e)/2-1);if(h===0){if(r==="")c=0;else c=Math.pow(2,e)/2-1-r.match(/^(0*)/)[0].length-1}let d=c.toString(2).padStart(e,"0");let f=n+d+(h.toString(2)+r).padEnd(i*8-1-e-h.toString(2).length,"0").substring(1);console.log(n,d,(h.toString(2)+r).padEnd(i*8-1-e-h.toString(2).length,"0").substring(1));let u=[];for(let t=0;t<i*8;t+=8){u.push(parseInt(f.substring(t,t+8),2))}if(s==="little")u.reverse();if(t===0)u.fill(0);return u}const b=".fudgedit-container{overflow:hidden;position:relative;min-height:100%;color:black;user-select:none}.overlay{height:100%;width:100%;position:absolute;background-color:#f008;overflow-y:scroll;z-index:4;pointer-events:none}.overlay::-webkit-scrollbar{pointer-events:all;width:100%}.overlay>.forceScroll{height:200%;width:100%;position:absolute}.hex{font-family:'Sourcecode Pro', Courier, monospace;font-size:15px;outline:none}.binView,.hexView,.asciiView,.lineLabels{display:inline-block;padding:0 10px;white-space:pre;position:relative}.binLine span,.hexLine span,.charLine span{position:relative;height:17px;display:inline-block}.binLine,.hexLine,.charLine,.lineLabel{height:17px}.binLine>span>span{position:relative;width:14px;padding:0 3px;box-sizing:border-box}.binLine span{padding:0 0px}.binLine>span>span.padBit::after{background-color:#0006;position:absolute;width:1px;height:100%;left:calc(100% + 0.5px);content:''}.binLine>span>span:last-child.padBit::after{width:2px;left:100%}.binLine>span:last-child>span:last-child.padBit::after{display:none}.charLine span{width:10px}.charLine>span.nonDisplay{opacity:var(--nd-opacity)}.hexLine span{position:relative;padding:0 5px;width:28px;box-sizing:border-box}.hexLine span:not(:last-child).padByte::after{background-color:#0006;position:absolute;width:2px;height:100%;left:calc(100% - 1px);content:''}.binLine span,.hexLine span{cursor:default;user-select:none}.binLine span.selected,.charLine span.selected,.hexLine span.selected{background-color:#8888FF80}.binLine span.cursor,.charLine span.cursor,.hexLine span.cursor{background-color:#008;color:#FFF}.binLine>span.added,.charLine span.added,.hexLine span.added{color:red}.binLine>span>span:hover,.charLine span:hover,.hexLine span:hover{background-color:#000;color:#FFF}.hexLine span.ASCII{font-weight:bold}.binLine:nth-child(2n-1),.hexLine:nth-child(2n-1),.charLine:nth-child(2n-1),.lineLabel:nth-child(2n-1){background-color:#EEFFFF}.binLine.selected,.charLine.selected,.hexLine.selected,.lineLabel.selected{background-color:#FFA}.separator{opacity:0;pointer-events:none}.region{opacity:1}.highlight{mix-blend-mode:multiply}.region{position:relative}.highlight:hover .region:not(:hover){fill:#0003}.find{width:calc(100% - 20px);height:50px;position:absolute;bottom:0;left:0;right:0;margin:auto;background-color:#fff;z-index:4}";const g=class{constructor(t){i(this,t);this.hexLineChanged=s(this,"hexLineChanged",7);this.hexCursorChanged=s(this,"hexCursorChanged",7);this.hexSelectionChanged=s(this,"hexSelectionChanged",7);this.hexDataChanged=s(this,"hexDataChanged",7);this.hexLoaded=s(this,"hexLoaded",7);this.wheel=t=>{t.preventDefault();let i=!Number.isInteger(t.deltaY)?Math.ceil(t.deltaY/100):Math.ceil(t.deltaY/2);if(i===-0)i-=1;if(Math.abs(t.deltaY)>70)i*=.1;if(t.ctrlKey&&t.shiftKey)i=Math.sign(i)*this.maxLines;else if(t.shiftKey)i=Math.sign(i);else if(t.ctrlKey)i*=20;document.getElementById("tooltip").setAttribute("active","false");if(this.lineNumber+i<0)this.lineNumber=0;else if(this.lineNumber+i>Math.floor(this.editController.length/this.bytesPerLine)-1)this.lineNumber=Math.floor(this.editController.length/this.bytesPerLine)-1;else this.lineNumber+=i};this.handleRegionKeyDown=t=>{t.preventDefault();console.log(t.target)};this.fileMetadata=undefined;this.file=undefined;this.ln=0;this.selection=undefined;this.cursor=undefined;this.bit=undefined;this.editingMode=undefined;this.searchType=h.ASCII;this.searchByteCount=1;this.searchEndian="big";this.searchInput="";this.searchResults=[];this.searchActive=false;this.displayAscii=true;this.displayHex=true;this.displayBin=false;this.maxLines=30;this.bytesPerLine=16;this.nonDisplayCharacter=o.DOT;this.nonDisplayOpacity=.45;this.chunks=[];this.displayAsChunks=false;this.asciiInline=false;this.bytesPerGroup=4;this.bitsPerGroup=8;this.mode="select";this.editType="readonly";this.regionDepth=2;this.regions=[]}get lineNumber(){return Math.floor(this.ln)}set lineNumber(t){this.ln=t}componentWillLoad(){this.file=new Uint8Array(1024).map(((t,i)=>i%256));this.editController=new u(this);this.regionScaleWidth=28;this.regionScaleHeight=17}componentDidLoad(){this.hexLoaded.emit(this.editController)}async acceptFile(t){console.log(t);this.fileMetadata=t;const i=new FileReader;i.readAsArrayBuffer(t);i.onload=t=>{this.file=new Uint8Array(t.target.result);this.editController=new u(this)}}async saveFile(){if(this.file==undefined)return;return this.editController.save()}async setLineNumber(t){if(t<0)this.lineNumber=0;else this.lineNumber=t;this.hexLineChanged.emit(this.lineNumber)}async setCursorPosition(t,i){if(i){let s=0;if(i>=8)s=Math.floor(i/8);this.cursor=t+s;this.bit=i%8}else{this.cursor=t}this.hexCursorChanged.emit({byte:this.cursor,bit:this.bit})}async setSelection(t){this.selection=Object.assign(Object.assign({},this.selection),t);this.hexSelectionChanged.emit(this.selection)}async getChunk(t,i){return this.editController.render(t,i)}async getFileMetadata(){return this.fileMetadata}async executeSearch(t,i,s,e,n){let h;try{h=this.formatSearch(t,i,e,n)}catch(t){console.log(t)}this.searchResults=this.editController.find(h,s?s[0]:0,s?s[1]-s[0]:undefined);return this.searchResults}buildHexView(){const{lineNumber:t,maxLines:i,bytesPerLine:s,bytesPerGroup:n,bitsPerGroup:h,asciiInline:o}=this;const l=t*s;const r=this.editController.render(l,i*s);const a=r.out;const c=r.meta.added;const d=[];for(let t=0;t<i;t++){d.push(a.subarray(t*s,(t+1)*s))}const f=[];const u=[];const p=[];let b=-1;for(const[t,i]of d.entries()){if(i.length===0)break;const r=l+t*s;const a=[];const d=[];const g=[];let v=this.nonDisplayCharacter;document.documentElement.style.setProperty("--nd-opacity",`${this.nonDisplayOpacity}`);for(const[s,l]of[...i.values()].entries()){let i;const f=[];if(/\w|[!@#$%^&*()_+=\]\\:;"'>.<,/?]/.test(String.fromCharCode(l))){v=String.fromCharCode(l)}else{f.push("nonDisplay");v=this.nonDisplayCharacter}if(o&&/\w/.test(v)){i="."+v}else{i=l.toString(16).toUpperCase().padStart(2,"0")}if(i.startsWith("."))f.push("ASCII");if(s%n===n-1)f.push("padByte");if(Math.floor(this.cursor)===r+s){f.push("cursor");b=t}if(this.selection&&this.selection.start<=r+s&&r+s<=this.selection.end)f.push("selected");for(const[t,i]of c){if(t<=r+s&&r+s<i){f.push("added");break}}let u=l.toString(2).padStart(8,"0").split("");let p=[];if(this.displayBin){for(let t=0;t<u.length;t++){let i="";if((s*8+t)%h==h-1)i+="padBit";if(f.includes("cursor")&&(this.bit===t||this.bit===-1))i+=" cursor";if(f.includes("selected")){if(this.selection.start===this.selection.end){if(t>=this.selection.startBit&&t<=this.selection.endBit)i+=" selected"}else if(this.selection.start===r+s){if(t>=this.selection.startBit)i+=" selected"}else if(this.selection.end===r+s){if(t<=this.selection.endBit||this.selection.endBit===-1)i+=" selected"}else i+=" selected"}p.push(e("span",{"data-cursor-idx":t,class:i},u[t]))}}if(this.displayBin)a.push(e("span",{"data-cursor-idx":r+s,class:"binGroup"+(f.includes("added")?" added":"")},p));if(this.displayAscii)d.push(e("span",{"data-cursor-idx":r+s,class:f.join(" ")},v));if(this.displayHex)g.push(e("span",{"data-cursor-idx":r+s,class:f.join(" ")},i))}if(this.displayBin)f.push(e("div",{class:"binLine"+(b===t?" selected":"")},a));if(this.displayHex){u.push(e("div",{class:"hexLine"+(b===t?" selected":"")},g))}else{u.push({})}if(this.displayAscii)p.push(e("div",{class:"charLine"+(b===t?" selected":"")},d))}while(u.length<i){f.push(e("div",{class:"binLine",style:{pointerEvents:"none"}},e("span",null,"-")));u.push(e("div",{class:"hexLine",style:{pointerEvents:"none"}},e("span",null,"-")));p.push(e("div",{class:"charLine",style:{pointerEvents:"none"}},e("span",null,"-")))}const g=[];for(let t=0;t<i;t++){g.push(e("div",{class:"lineLabel"+(b===t?" selected":""),style:{pointerEvents:"none"}},"0x"+(l+t*s).toString(16).padStart(8," ")))}const v=[];const x=[];const w=[];const y=(i,s=0,n)=>{if(i.end<l||i.start>l+this.maxLines*this.bytesPerLine){if(i.subRegions&&s+1!==this.regionDepth){for(const[t,e]of i.subRegions.entries())y(e,s+1,t)}return}if(s===this.regionDepth)return;const h=i.start%this.bytesPerLine;const o=i.end%this.bytesPerLine;const r=Math.floor((i.end-i.start+h)/this.bytesPerLine);const a=Math.floor(i.start/this.bytesPerLine)-t;const c={0:["#88F","#BBF"],1:["#F88","#FBB"],2:["#8D8","#BDB"]};const d=(t,l)=>e("polygon",{onMouseMove:t=>{if(document.getElementById("tooltip").getAttribute("active")==="frozen")return;if(this.canUpdateMouseMove===undefined){this.canUpdateMouseMove=true}if(this.canUpdateMouseMove){this.canUpdateMouseMove=false;document.documentElement.style.setProperty("--mouse-x",`${t.clientX}`);document.documentElement.style.setProperty("--mouse-y",`${t.clientY}`);document.getElementById("tooltip").setAttribute("active","true");document.getElementById("tooltip").setAttribute("complex",`${JSON.stringify(Object.assign(Object.assign({},i),{subRegions:i.subRegions?i.subRegions.map((t=>t.name)):null}))}`);setTimeout((()=>{this.canUpdateMouseMove=true}),50)}},onMouseLeave:()=>{if(document.getElementById("tooltip").getAttribute("active")==="true")document.getElementById("tooltip").setAttribute("active","false")},onClick:t=>{var s,e,n;if(document.getElementById("tooltip").getAttribute("active")==="frozen"){if(((n=(e=(s=document.getSelection().anchorNode)===null||s===void 0?void 0:s.parentElement)===null||e===void 0?void 0:e.parentElement)===null||n===void 0?void 0:n.tagName)==="HEX-TOOLTIP"){document.getSelection().empty()}document.documentElement.style.setProperty("--mouse-x",`${t.clientX}`);document.documentElement.style.setProperty("--mouse-y",`${t.clientY}`);document.getElementById("tooltip").setAttribute("active","true");document.getElementById("tooltip").setAttribute("complex",`${JSON.stringify(Object.assign(Object.assign({},i),{subRegions:i.subRegions?i.subRegions.map((t=>t.name)):null}))}`)}else{document.getElementById("tooltip").setAttribute("active","frozen");document.documentElement.style.setProperty("--mouse-x",`${t.clientX-10}`);document.documentElement.style.setProperty("--mouse-y",`${t.clientY-10}`)}},class:"region",points:`\n              0,${(1+a)*l}\n              ${h*t},${(1+a)*l}\n              ${h*t},${a*l}\n              ${this.bytesPerLine*t},${a*l}\n              ${this.bytesPerLine*t},${(r+a)*l}\n              ${o*t},${(r+a)*l}\n              ${o*t},${(r+a+1)*l}\n              0,${(r+1+a)*l}\n            `,fill:i.color||c[s%3][n%2],stroke:"none"});v.push(d(14*8,this.regionScaleHeight));x.push(d(this.regionScaleWidth,this.regionScaleHeight));w.push(d(10,this.regionScaleHeight));if(i.subRegions&&s+1!==this.regionDepth){for(const[t,e]of i.subRegions.entries())y(e,s+1,t)}};for(const[t,i]of this.regions.entries()){y(i,0,t)}const L=e("svg",{viewBox:`0 0 ${this.bytesPerLine*14*8} ${this.maxLines*this.regionScaleHeight}`,width:`${this.bytesPerLine*14*8}`,height:`${this.maxLines*this.regionScaleHeight}`},v);const m=e("svg",{viewBox:`0 0 ${this.bytesPerLine*this.regionScaleWidth} ${this.maxLines*this.regionScaleHeight}`,width:`${this.bytesPerLine*this.regionScaleWidth}`,height:`${this.maxLines*this.regionScaleHeight}`},x);const $=e("svg",{viewBox:`0 0 ${this.bytesPerLine*10} ${this.maxLines*this.regionScaleHeight}`,width:`${this.bytesPerLine*10}`,height:`${this.maxLines*this.regionScaleHeight}`},w);return{lineViews:u,charViews:p,binViews:f,lineLabels:g,binRegions:L,hexRegions:m,asciiRegions:$}}buildChunks(){const{lineNumber:t,maxLines:i,bytesPerLine:s,bytesPerGroup:n,chunks:h,bitsPerGroup:o,asciiInline:l}=this;const r={chunk:0,chunkLineOffs:0};for(let i=t,e=0;i>0&&e<h.length;i--,e++){const t=Math.floor((h[e].end-h[e].start)/s)+1;i-=t;if(i>0)r.chunk+=1;else r.chunkLineOffs=t-i*-1}const a=[];for(let t=r.chunk,e=0;e<i&&t<h.length;t++){const n=e;const o=h[t];let l=o.start;if(t==r.chunk)l+=s*r.chunkLineOffs;if(o.end-l<=0){continue}e+=Math.ceil((o.end-l)/s);let c=o.end;if(e>i)c-=(e-i)*s;const d=this.editController.render(l,c-l).out;a.push({start:l,data:d,startLine:n,endLine:e});for(let t=0;t<1;t++){e+=1;a.push({data:new Uint8Array(0),start:-1,startLine:-1,endLine:-1})}}a.pop();let c=[];let d=[];let f=[];let u=[];const p=[];const b=[];const g=[];for(const{start:t,data:i,startLine:h}of a){if(t===-1){u.push(e("div",{class:"separator",style:{pointerEvents:"none"}},"NA"));c.push(e("div",{class:"separator",style:{pointerEvents:"none"}},"NA"));d.push(e("div",{class:"separator",style:{pointerEvents:"none"}},"NA"));f.push(e("div",{class:"separator",style:{pointerEvents:"none"}},"NA"));continue}for(let h=0;h<i.length;h+=s){const r=t+h;const a=[];const p=[];const b=[];let g=-1;for(let c=h;c<h+s&&c<i.length;c++){const s=i[c];const d=t+c;let f;let u;if(/\w|[!@#$%^&*()_+=\]\\:;"'>.<,/?]/.test(String.fromCharCode(s))){u=String.fromCharCode(s)}else{u=this.nonDisplayCharacter}if(l&&/\w/.test(u)){f="."+u}else{f=s.toString(16).toUpperCase().padStart(2,"0")}const v=[];if(f.startsWith("."))v.push("ASCII");if((c-h)%n===n-1)v.push("padByte");if(Math.floor(this.cursor)===d){v.push("cursor");g=r}if(this.selection&&this.selection.start<=d&&d<=this.selection.end)v.push("selected");let x=s.toString(2).padStart(8,"0").split("");let w=[];if(this.displayBin){for(let t=0;t<x.length;t++){let i="";if((d*8+t)%o==o-1)i+="padBit";if(v.includes("cursor")&&(this.bit===t||this.bit===-1))i+=" cursor";if(v.includes("selected")){if(this.selection.start===this.selection.end){if(t>=this.selection.startBit&&t<=this.selection.endBit)i+=" selected"}else if(this.selection.start==d){if(t>=this.selection.startBit)i+=" selected"}else if(this.selection.end==d){if(t<=this.selection.endBit||this.selection.endBit===-1)i+=" selected"}else i+=" selected"}w.push(e("span",{"data-cursor-idx":t,class:i},x[t]))}}if(this.displayBin)b.push(e("span",{"data-cursor-idx":d,class:"binGroup"+(v.includes("added")?" added":"")},w));if(this.displayAscii)p.push(e("span",{"data-cursor-idx":d,class:v.join(" ")},u));if(this.displayHex)a.push(e("span",{"data-cursor-idx":d,class:v.join(" ")},f))}u.push(e("div",{class:"lineLabel"+(g===r?" selected":""),style:{pointerEvents:"none"}},"0x"+r.toString(16).padStart(8," ")));if(this.displayBin)f.push(e("div",{class:"binLine"+(g===r?" selected":"")},b));if(this.displayHex){c.push(e("div",{class:"hexLine"+(g===r?" selected":"")},a))}else{c.push({})}if(this.displayAscii)d.push(e("div",{class:"charLine"+(g===r?" selected":"")},p))}const r=(n,o=0,l)=>{const a=Math.floor(i.length/s);const c=t%s;if(n.end<t||n.start>t+a*s){if(n.subRegions&&o+1!==this.regionDepth){for(const[t,i]of n.subRegions.entries())r(i,o+1,t)}return}if(o===this.regionDepth)return;const d=Math.max(n.start,t);const f=Math.min(n.end,t+i.length);const u=(d-c)%s;const v=(f-c)%s;const x=Math.floor((f-d+u)/s);const w=Math.floor((d-t)/s)+h;const y={0:["#88F","#BBF"],1:["#F88","#FBB"],2:["#8D8","#BDB"]};const L=(t,i)=>e("polygon",{onMouseMove:t=>{if(this.canUpdateMouseMove===undefined){this.canUpdateMouseMove=true}if(this.canUpdateMouseMove){this.canUpdateMouseMove=false;document.documentElement.style.setProperty("--mouse-x",`${t.clientX}`);document.documentElement.style.setProperty("--mouse-y",`${t.clientY}`);document.getElementById("tooltip").setAttribute("active","true");document.getElementById("tooltip").setAttribute("complex",`${JSON.stringify(Object.assign(Object.assign({},n),{subRegions:n.subRegions?n.subRegions.map((t=>t.name)):null}))}`);setTimeout((()=>{this.canUpdateMouseMove=true}),50)}},onMouseLeave:()=>document.getElementById("tooltip").setAttribute("active","false"),class:"region",points:`\n              0,${(1+w)*i}\n              ${u*t},${(1+w)*i}\n              ${u*t},${w*i}\n              ${this.bytesPerLine*t},${w*i}\n              ${this.bytesPerLine*t},${(x+w)*i}\n              ${v*t},${(x+w)*i}\n              ${v*t},${(x+w+1)*i}\n              0,${(x+1+w)*i}\n            `,fill:n.color||y[o%3][l%2],stroke:"none"});p.push(L(14*8,this.regionScaleHeight));b.push(L(this.regionScaleWidth,this.regionScaleHeight));g.push(L(10,this.regionScaleHeight));if(n.subRegions&&o+1!==this.regionDepth){for(const[t,i]of n.subRegions.entries())r(i,o+1,t)}};for(const[t,i]of this.regions.entries()){r(i,0,t)}}while(c.length<i){u.push(e("div",{class:"separator"},e("span",null,"-")));f.push(e("div",{class:"separator"},e("span",null,"-")));c.push(e("div",{class:"separator"},e("span",null,"-")));d.push(e("div",{class:"separator"},e("span",null,"-")))}const v=e("svg",{viewBox:`0 0 ${this.bytesPerLine*14*8} ${this.maxLines*this.regionScaleHeight}`,width:`${this.bytesPerLine*14*8}`,height:`${this.maxLines*this.regionScaleHeight}`},p);const x=e("svg",{viewBox:`0 0 ${this.bytesPerLine*this.regionScaleWidth} ${this.maxLines*this.regionScaleHeight}`,width:`${this.bytesPerLine*this.regionScaleWidth}`,height:`${this.maxLines*this.regionScaleHeight}`},b);const w=e("svg",{viewBox:`0 0 ${this.bytesPerLine*10} ${this.maxLines*this.regionScaleHeight}`,width:`${this.bytesPerLine*10}`,height:`${this.maxLines*this.regionScaleHeight}`},g);return{lineViews:c,charViews:d,binViews:f,lineLabels:u,binRegions:v,hexRegions:x,asciiRegions:w}}edit(i){if(i.target.className!=="hex")return;const s={ArrowDown:()=>{this.setCursorPosition(this.cursor+this.bytesPerLine>this.editController.length?this.editController.length:this.cursor+this.bytesPerLine)},ArrowUp:()=>{this.setCursorPosition(this.cursor-this.bytesPerLine<0?0:this.cursor-this.bytesPerLine)},ArrowRight:()=>{this.setCursorPosition(this.cursor+1>this.editController.length?this.editController.length:this.cursor+1)},ArrowLeft:()=>{this.setCursorPosition(this.cursor-1<0?0:this.cursor-1)}};if(s[i.key]){i.preventDefault();if(this.editController.inProgress)this.editController.commit();s[i.key]();if(this.cursor>(this.lineNumber+this.maxLines)*this.bytesPerLine-1)this.setLineNumber(Math.floor(this.cursor/this.bytesPerLine)-this.maxLines+1);else if(this.cursor<this.lineNumber*this.bytesPerLine)this.setLineNumber(Math.floor(this.cursor/this.bytesPerLine));if(i.shiftKey){if(this.selection.start>this.cursor)this.setSelection({start:this.cursor});else this.setSelection({end:this.cursor})}else{this.setSelection({start:this.cursor,end:this.cursor})}}else if((i.ctrlKey||i.metaKey)&&i.key==="f"){i.preventDefault();this.searchActive=!this.searchActive;t(this)}else{if(this.editType==="readonly")return;i.preventDefault();this.editController.buildEdit(i)}}formatSearch(t,i,s,e){if(t.length===0)throw new Error("LEN0: there needs to be something to search for...");switch(i){case h.INTEGER:const i=parseInt("0x"+new Array(s+1).join("FF"),16);let n=parseInt(t);if(Math.abs(n)>i){n=i*Math.sign(n)}const o=n.toString(16).padStart(2*s,"0").match(/.{2}/g).map((t=>parseInt(t,16)));if(e==="little")o.reverse();return o;case h.FLOAT:return p(parseFloat(t),s,e);case h.BYTE:if(/[^0-9a-f ,|;]/gi.test(t))throw new Error("UC: Unexpected Character (must be exclusively 0-9 and a-f)");else{return t.replace(/[ ,|;]/gi,"").match(/.{2}/g).map((t=>parseInt(t,16)))}case h.ASCII:default:return t.split("").map((t=>t.charCodeAt(0)))}}async findInSelection(){const t=this.selection?this.selection.end-this.selection.start:0;this.searchResults=await this.executeSearch(this.searchInput,this.searchType,t===0?undefined:[this.selection.start,this.selection.end],this.searchByteCount,this.searchEndian)}showHex(){const{lineViews:t,binViews:i,charViews:s,lineLabels:n,binRegions:o,hexRegions:l,asciiRegions:r}=this.buildHexView();let a;try{a=this.formatSearch(this.searchInput,this.searchType,this.searchByteCount,this.searchEndian).map((t=>t.toString(16).padStart(2,"0"))).join(", ")}catch(t){if(t.message.startsWith("LEN0"))a="";else a=t.message}let c;if(this.searchActive){const t=t=>{let i=parseInt(t);this.setCursorPosition(i);this.setSelection({start:i,end:i+([h.INTEGER,h.FLOAT].includes(this.searchType)?this.searchByteCount:this.searchInput.length)-1,startBit:-1,endBit:-1});this.setLineNumber(Math.floor(i/this.bytesPerLine)-this.maxLines/2)};c=e("select",{onChange:i=>t(i.target.value)},this.searchResults.map((t=>e("option",{value:t},`0x${t.toString(16)}`))))}return e("div",{class:"hex",onMouseEnter:t=>this._toggleScrollListener(t),onMouseLeave:t=>this._toggleScrollListener(t),onMouseDown:t=>this.beginSelection(t),onMouseUp:t=>this.endSelection(t),tabindex:"0",onKeyDown:t=>this.edit(t)},e("div",{id:"MEASURE",class:"hex",style:{position:"absolute",visibility:"hidden",padding:"0 5px"}},"AB"),e("div",{class:"lineLabels"},n),this.displayBin?e("div",{class:"binView"},e("div",{class:"highlight",style:{position:"absolute",top:"0",display:this.mode==="noregion"?"none":"block",zIndex:this.mode==="region"?"3":"0"}},o),e("div",{class:"main"},i)):null,this.displayHex?e("div",{class:"hexView"},e("div",{class:"highlight",style:{position:"absolute",top:"0",display:this.mode==="noregion"?"none":"block",zIndex:this.mode==="region"?"3":"0"}},l),e("div",{class:"main"},t)):null,this.displayAscii?e("div",{class:"asciiView"},e("div",{class:"highlight",style:{position:"absolute",top:"0",display:this.mode==="noregion"?"none":"block",zIndex:this.mode==="region"?"3":"0"}},r),e("div",{class:"main"},s)):null,this.searchActive?e("div",{class:"find"},"search:",e("input",{type:"text",onChange:t=>this.searchInput=t.target.value}),e("select",{onChange:t=>this.searchType=t.target.value},e("option",{value:h.ASCII},"ASCII string"),e("option",{value:h.BYTE},"bytes"),e("option",{value:h.INTEGER},"integer"),e("option",{value:h.FLOAT},"float")),[h.INTEGER,h.FLOAT].includes(this.searchType)?[e("select",{onChange:t=>this.searchByteCount=parseInt(t.target.value)},e("option",{value:"1"},"1 byte"),e("option",{value:"2"},"2 bytes"),e("option",{value:"4"},"4 bytes"),e("option",{value:"8"},"8 bytes")),e("select",{onChange:t=>this.searchEndian=t.target.value},e("option",{value:"big"},"big endian"),e("option",{value:"little"},"little endian"))]:null,e("button",{onClick:()=>this.findInSelection()},"search"),e("br",null),"hex: ",a," | results: ",c):null)}showChunks(){const{lineViews:t,binViews:i,charViews:s,lineLabels:n,binRegions:h,hexRegions:o,asciiRegions:l}=this.buildChunks();return e("div",{class:"hex",onMouseEnter:t=>this._toggleScrollListener(t),onMouseLeave:t=>this._toggleScrollListener(t),onMouseDown:t=>this.beginSelection(t),onMouseUp:t=>this.endSelection(t),tabindex:"0",onKeyDown:t=>this.edit(t)},e("div",{id:"MEASURE",class:"hex",style:{position:"absolute",visibility:"hidden",padding:"0 5px"}},"AB"),e("div",{class:"lineLabels"},n),this.displayBin?e("div",{class:"binView"},e("div",{class:"highlight",style:{position:"absolute",top:"0",display:this.mode==="noregion"?"none":"block",zIndex:this.mode==="region"?"3":"0"}},h),e("div",{class:"main"},i)):null,this.displayHex?e("div",{class:"hexView"},e("div",{class:"highlight",style:{position:"absolute",top:"0",display:this.mode==="noregion"?"none":"block",zIndex:this.mode==="region"?"3":"0"}},o),e("div",{class:"main"},t)):null,this.displayAscii?e("div",{class:"asciiView"},e("div",{class:"highlight",style:{position:"absolute",top:"0",display:this.mode==="noregion"?"none":"block",zIndex:this.mode==="region"?"3":"0"}},l),e("div",{class:"main"},s)):null)}beginSelection(t){if(t.target.id==="HEX-SCROLLBAR")return;if(t.target.parentElement.tagName=="svg")return;const i=t.target.parentElement.className;if(!i)return;if(i.includes("charLine"))this.editingMode=n.ASCII;else if(i.includes("hexLine"))this.editingMode=n.BYTE;else if(i.includes("binGroup"))this.editingMode=n.BIT;else return;if(this.editingMode===n.BIT){this.tempSelection={byte:parseInt(t.composedPath()[1].getAttribute("data-cursor-idx")),bit:parseInt(t.target.getAttribute("data-cursor-idx"))}}else{this.tempSelection={byte:parseInt(t.target.getAttribute("data-cursor-idx")),bit:-1}}}endSelection(t){if(this.tempSelection===null)return;if(t.target.parentElement.tagName=="svg")return;const i=t.target.parentElement.className;if(i.includes("charLine"))this.editingMode=n.ASCII;else if(i.includes("hexLine"))this.editingMode=n.BYTE;else if(i.includes("binGroup"))this.editingMode=n.BIT;else return;let s;if(this.editingMode===n.BIT){s={byte:parseInt(t.composedPath()[1].getAttribute("data-cursor-idx")),bit:parseInt(t.target.getAttribute("data-cursor-idx"))}}else{s={byte:parseInt(t.target.getAttribute("data-cursor-idx")),bit:-1}}if(this.tempSelection.byte+this.tempSelection.bit/10>s.byte+s.bit/10){this.setSelection({start:s.byte,startBit:s.bit,end:this.tempSelection.byte,endBit:this.tempSelection.bit})}else{this.setSelection({start:this.tempSelection.byte,startBit:this.tempSelection.bit,end:s.byte,endBit:s.bit})}this.tempSelection=null;this.cursor=s.byte;this.bit=s.bit;this.hexCursorChanged.emit({byte:this.cursor,bit:this.bit});this.hexSelectionChanged.emit(this.selection);if(this.editController.isInProgress){this.editController.commit();this.hexDataChanged.emit()}}render(){let t;if(this.displayAsChunks)t=this.showChunks();else t=this.showHex();return e("div",{class:"fudgedit-container"},t)}_toggleScrollListener(t){if(t.type==="mouseenter"){t.target.addEventListener("wheel",this.wheel,{passive:false})}else{t.target.removeEventListener("wheel",this.wheel,false)}}};g.style=b;const v="hex-tooltip{position:fixed;display:none;box-sizing:border-box;font-size:14px;max-width:400px;padding:5px;border-radius:2px;background-color:#000;color:white;z-index:1000;pointer-events:none;font-family:'Courier New', Courier, monospace;font-size:14px}hex-tooltip:not([active=false]){display:block;left:calc(var(--mouse-x) * 1px);top:calc(var(--mouse-y) * 1px);transition:.2s left ease, .2s top ease}hex-tooltip[active=frozen]{pointer-events:all;user-select:text;transition:none}";const x=class{constructor(t){i(this,t);this.active="false";this.data=undefined;this.simpleText=undefined}render(){const t=[];if(this.data){let i=typeof this.data==="string"?JSON.parse(this.data):this.data;if(i.name)t.push(e("span",null,`name: ${i.name}`),e("br",null));t.push(e("span",null,`size: ${i.end-i.start} [0x${i.start.toString(16)} - 0x${i.end.toString(16)}]`),e("br",null));for(const[s,n]of Object.entries(i)){if(["name","subRegions","start","end"].includes(s))continue;if(n!==null){t.push(e("span",null,s,": ",n),e("br",null))}}}else if(this.simpleText){t.push(e("span",null,this.simpleText))}else{t.push(e("span",null,"placeholder"))}return t}};x.style=v;export{g as hex_editor,x as hex_tooltip};
//# sourceMappingURL=p-857ca353.entry.js.map