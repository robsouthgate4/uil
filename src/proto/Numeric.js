import { Proto } from '../core/Proto';
import { Tools } from '../core/Tools';

function Numeric( o ){

    Proto.call( this, o );

    this.setTypeNumber( o );

    this.allway = o.allway || false;

    this.isDown = false;

    this.value = [0];
    this.multy = 1;
    this.invmulty = 1;
    this.isSingle = true;
    this.isAngle = false;
    this.isVector = false;

    if( o.isAngle ){
        this.isAngle = true;
        this.multy = Tools.torad;
        this.invmulty = Tools.todeg;
    }

    this.isDrag = o.drag || false;

    if( o.value !== undefined ){
        if(!isNaN(o.value)){ 
            this.value = [o.value];
        } else if( o.value instanceof Array ){ 
            this.value = o.value; 
            this.isSingle = false;
        } else if( o.value instanceof Object ){ 
            this.value = [];
            if( o.value.x !== undefined ) this.value[0] = o.value.x;
            if( o.value.y !== undefined ) this.value[1] = o.value.y;
            if( o.value.z !== undefined ) this.value[2] = o.value.z;
            if( o.value.w !== undefined ) this.value[3] = o.value.w;
            this.isVector = true;
            this.isSingle = false;
        }
    }

    this.lng = this.value.length;
    this.tmp = [];

    

    this.current = -1;
    this.prev = { x:0, y:0, d:0, v:0 };

    // bg
    this.c[2] = this.dom( 'div', this.css.basic + ' background:' + this.colors.select + '; top:4px; width:0px; height:' + (this.h-8) + 'px;' );

    this.cMode = [];
    
    var i = this.lng;
    while(i--){

        if(this.isAngle) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
        this.c[3+i] = this.dom( 'div', this.css.txtselect + ' height:'+(this.h-4)+'px; background:' + this.colors.inputBg + '; borderColor:' + this.colors.inputBorder+'; border-radius:'+this.radius+'px;');
        if(o.center) this.c[2+i].style.textAlign = 'center';
        this.c[3+i].textContent = this.value[i];
        this.c[3+i].style.color = this.fontColor;
        this.c[3+i].isNum = true;

        this.cMode[i] = 0;

    }

    // cursor
    this.cursorId = 3 + this.lng;
    this.c[ this.cursorId ] = this.dom( 'div', this.css.basic + 'top:4px; height:' + (this.h-8) + 'px; width:0px; background:'+this.fontColor+';' );

    this.init();
}

Numeric.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Numeric,

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        var i = this.lng;
        var t = this.tmp;
        

        while( i-- ){
            if( l.x>t[i][0] && l.x<t[i][2] ) return i;
        }

        return '';

    },

   /* mode: function ( n, name ) {

        if( n === this.cMode[name] ) return false;

        //var m;

        /*switch(n){

            case 0: m = this.colors.border; break;
            case 1: m = this.colors.borderOver; break;
            case 2: m = this.colors.borderSelect;  break;

        }*/

   /*     this.reset();
        //this.c[name+2].style.borderColor = m;
        this.cMode[name] = n;

        return true;

    },*/

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown: function ( e ) {

        var name = this.testZone( e );

        if( !this.isDown ){
            this.isDown = true;
            if( name !== '' ){ 
            	this.current = name;
            	this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isSingle ? parseFloat(this.value) : parseFloat( this.value[ this.current ] )  };
            	this.setInput( this.c[ 3 + this.current ] );
            }
            return this.mousemove( e );
        }

        return false;
        /*

        if( name === '' ) return false;


        this.current = name;
        this.isDown = true;

        this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isSingle ? parseFloat(this.value) : parseFloat( this.value[ this.current ] )  };


        return this.mode( 2, name );*/

    },

    mouseup: function ( e ) {

    	if( this.isDown ){
            
            this.isDown = false;
            //this.current = -1;
            this.prev = { x:0, y:0, d:0, v:0 };

            return this.mousemove( e );
        }

        return false;

        /*var name = this.testZone( e );
        this.isDown = false;

        if( this.current !== -1 ){ 

            //var tm = this.current;
            var td = this.prev.d;

            this.current = -1;
            this.prev = { x:0, y:0, d:0, v:0 };

            if( !td ){

                this.setInput( this.c[ 3 + name ] );
                return true;//this.mode( 2, name );

            } else {
                return this.reset();//this.mode( 0, tm );
            }

        }*/

    },

    mousemove: function ( e ) {

        var nup = false;
        var x = 0;

        var name = this.testZone( e );

        if( name === '' ) this.cursor();
        else{ 
        	if(!this.isDrag) this.cursor('text');
        	else this.cursor( this.current !== -1 ? 'move' : 'pointer' );
        }

        

        if( this.isDrag ){

        	if( this.current !== -1 ){

            	this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );

                var n = this.prev.v + ( this.prev.d * this.step);

                this.value[ this.current ] = this.numValue(n);
                this.c[ 3 + this.current ].textContent = this.value[this.current];

                this.validate();

                this.prev.x = e.clientX;
                this.prev.y = e.clientY;

                nup = true;
             }

        } else {

        	if( this.isDown ) x = e.clientX - this.zone.x -3;
        	if( this.current !== -1 ) x -= this.tmp[this.current][0]
        	return this.upInput( x, this.isDown );

        }

        


        return nup;

    },

    //keydown: function ( e ) { return true; },

    // ----------------------

    reset: function () {

        var nup = false;
        //this.isDown = false;

        //this.current = 0;

       /* var i = this.lng;
        while(i--){ 
            if(this.cMode[i]!==0){
                this.cMode[i] = 0;
                //this.c[2+i].style.borderColor = this.colors.border;
                nup = true;
            }
        }*/

        return nup;

    },


    setValue: function ( v ) {

        if( this.isVector ){

            if( v.x !== undefined ) this.value[0] = v.x;
            if( v.y !== undefined ) this.value[1] = v.y;
            if( v.z !== undefined ) this.value[2] = v.z;
            if( v.w !== undefined ) this.value[3] = v.w;

        } else {
            this.value = v;
        }

        
        
        this.update();

        //var i = this.value.length;

        /*n = n || 0;
        this.value[n] = this.numValue( v );
        this.c[ 3 + n ].textContent = this.value[n];*/

    },

    sameStr: function ( str ){

        var i = this.value.length;
        while(i--) this.c[ 3 + i ].textContent = str;

    },

    update: function ( up ) {

        var i = this.value.length;

        while(i--){
             this.value[i] = this.numValue( this.value[i] * this.invmulty );
             this.c[ 3 + i ].textContent = this.value[i];
        }

        if( up ) this.send();

    },

    send: function ( v ) {

        v = v || this.value;

        this.isSend = true;

        if( this.objectLink !== null ){ 

            if( this.isVector ){

                this.objectLink[ this.val ].fromArray( v );

                /*this.objectLink[ this.val ].x = v[0];
                this.objectLink[ this.val ].y = v[1];
                this.objectLink[ this.val ].z = v[2];
                if( v[3] ) this.objectLink[ this.val ].w = v[3];*/

            } else {
                this.objectLink[ this.val ] = v;
            }

        }

        if( this.callback ) this.callback( v, this.val );

        this.isSend = false;

    },


    // ----------------------
    //   INPUT
    // ----------------------

    select: function ( c, e, w ) {

        var s = this.s;
        var d = this.current !== -1 ? this.tmp[this.current][0] + 5 : 0;
        s[this.cursorId].width = '1px';
        s[this.cursorId].left = ( d + c ) + 'px';
        s[2].left = ( d + e ) + 'px';
        s[2].width = w + 'px';
    
    },

    unselect: function () {

        var s = this.s;
        if(!s) return;
        s[2].width = 0 + 'px';
        s[this.cursorId].width = 0 + 'px';

    },

    validate: function ( force ) {

        var ar = [];
        var i = this.lng;

        if( this.allway ) force = true;

        while(i--){
        	if(!isNaN( this.c[ 3 + i ].textContent )){ 
                var nx = this.numValue( this.c[ 3 + i ].textContent );
                this.c[ 3 + i ].textContent = nx;
                this.value[i] = nx;
            } else { // not number
                this.c[ 3 + i ].textContent = this.value[i];
            }

        	ar[i] = this.value[i] * this.multy;
        }

        if( !force ) return;

        if( this.isSingle ) this.send( ar[0] );
        else this.send( ar );

    },

    // ----------------------
    //   REZISE
    // ----------------------

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var w = Math.floor( ( this.sb + 5 ) / this.lng )-5;
        var s = this.s;
        var i = this.lng;
        while(i--){
            this.tmp[i] = [ Math.floor( this.sa + ( w * i )+( 5 * i )), w ];
            this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
            s[ 3 + i ].left = this.tmp[i][0] + 'px';
            s[ 3 + i ].width = this.tmp[i][1] + 'px';
        }

    }

} );

export { Numeric };