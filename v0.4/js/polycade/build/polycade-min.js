async("polycade.base",["theory"],function(e){return async.ref("polycade",{}).base=e.mergeAndClone(e.base,{prepOptions:function(t){return this.options=e.mergeAndClone(this.defaultOptions||{},t)}})}),async("polycade.entities.base",["jq","Phaser","theory","underscore","polycade.imagination.body"],function(e,t,s,i){var n=async.ref("polycade",{});n.entities=n.entities||{};var a=n.entities.base||{},r=void 0;return n.phaser={},n.phaser.sprite=function(e,s,i,n){t.Sprite.call(this,e.phaser,s,i,n),this.polycade=e},n.phaser.sprite.prototype=Object.create(t.Sprite.prototype),n.phaser.sprite.prototype.constructor=n.phaser.sprite,n.objects={},n.objects.scale=s.base.mix({},{prep:function(e,t){return t}}),n.objects.position=s.base.mix({},{prep:function(e,t){switch(this.entity=e,this.x=i.isNumber(t.x)?{value:t.x}:t.x,this.y=i.isNumber(t.y)?{value:t.y}:t.y,t.x.function){case"percent":_get=this.xPercent;break;case"pixel":default:_get=this.xPixel}switch(this.x.entity=e,this.x.get=_get,t.y.function){case"percent":_get=this.yPercent;break;case"pixel":default:_get=this.yPixel}return this.y.entity=e,this.y.get=_get,this},xPercent:function(){return this.entity.game.viewport.width*this.value},xPixel:function(){return this.value},yPercent:function(){return this.entity.game.viewport.height*this.value},yPixel:function(){return this.value},applyTo:function(e){return e=e||{},e.x=this.x(),e.y=this.y(),e}}),n.entities.base=s.base.mix(a,{prep:function(e){return e=this.options=e||{},this.prepHandlers(),e.sprite&&this.prepSprite(e.sprite),e.body&&this.prepBody(e.body),e.ibody&&this.prepiBody(e.ibody),this.prepEvents(e.events),e.shadow&&this.prepShadow(e.shadow),e.controller&&this.prepController(e.controller),e.id&&(this.game[e.id]=this),this},prepHandlers:function(){return this.objects={},this.objects.position=n.objects.position.namespace(),this.objects.scale=n.objects.scale.namespace(),this.handlers=s.bindCollection(this.handlers||{},this),this},prepSprite:function(e){this.sprite=new n.phaser.sprite(this,-999,-999,e.source.cacheName?e.source.cacheName:e.source),this.sprite.processors={position:this.objects.position.create(this,e.position),scale:this.objects.scale.create(this,e.scale)},e.group?e.group.add(this.sprite):this.phaser.add.existing(this.sprite);var t=this.sprite.processors.position.x.get(),s=this.sprite.processors.position.y.get();return this.sprite.position.x=t,this.sprite.position.y=s,this.sprite.inputEnabled=!0,this.sprite.events.onInputDown.add(function(){alert(this.options.id)},this),e.scale!==r&&(this.sprite.scale=e.scale),e.anchor!==r&&(this.sprite.anchor=e.anchor),e.blendMode!==r&&(this.sprite.blendMode=e.blendMode),this},prepBody:function(e){return this.phaser.physics.enable(this.sprite,t.Physics.ARCADE),e.collideWorldBounds!==r&&(this.sprite.body.collideWorldBounds=e.collideWorldBounds),e.allowGravity!==r&&(this.sprite.body.allowGravity=e.allowGravity),e.immovable!==r&&(this.sprite.body.immovable=e.immovable),this},prepiBody:function(e){if(!e.disabled)return this.sprite.ibody=n.imagination.body.create(e),this.sprite.ibody.debugDraw(this.phaser,this.sprite),this},prepEvents:function(e){return this.sprite?this.events=this.game.events.createFrom(this.sprite.events):this.events=this.game.events.create(),e&&this.events.extend(e),this},prepShadow:function(e){return this.shadow=this.game.entities.shadow.create(this,e),this},prepController:function(e){return this},collide:function(e){return this.sprite&&this.sprite.ibody?this.sprite.ibody.collide(e):this.sprite?this.phaser.physics.arcade.collide(e,this.sprite):void 0}}),console.log("BASE",n.entities),a}),async("polycade.entities.shadow",["jq","Phaser","theory","underscore"],function(e,t,s,i){var n=async.ref("polycade",{});return n.entities=n.entities||{},n.entities.shadow=s.base.mix(n.entities.shadow||{},{prep:function(e,i){return this.owner=e,this.source=i.source,this.handlers=s.bindCollection(this.handlers,this),this.events={},this.events.update=new t.Signal,this.events.resize=new t.Signal,this.sprite=new n.phaser.sprite(this,-999,-999,i.source.cacheName?i.source.cacheName:i.source),this},makeSimple:function(){this.events.resize.add(this.handlers.resize),this.events.update.remove(this.handlers.update)},makeTracking:function(){this.events.resize.remove(this.handlers.resize),this.events.update.add(this.handlers.update)},cast:function(){var e=this.i.game.globalPosition(this.i.owner),s=this.i.game.globalPosition(this.i.source),i=t.Point.angle(e,s);console.log(i)},handlers:{resize:function(){this.cast()},update:function(){this.cast()}}}),console.log("SHADOW",n.entities),n.entities.shadow}),async("polycade.entities.adornment",["jq","Phaser","theory"],function(e,t,s){var i=async.ref("polycade",{});i.entities=i.entities||{};var n=i.entities.adornment||{};return i.entities.adornment=s.base.mix(n,{prep:function(e){},update:function(){},collide:function(e){}}),n}),async.tmp.includes=["underscore","jq","theory","Phaser","verge","q"],async.tmp.managers=["polycade.events","polycade.screens","polycade.assets"],async.tmp.core=["polycade.entities.base","polycade.entities.shadow","polycade.controllers.user"],async("polycade.game",async.tmp.includes,async.tmp.managers,async.tmp.core,function(e,t,s,i,n,a){var r=async.ref("polycade",{});return console.log(">>>>",r.base.mix),r.game=r.base.mix(r.game,{name:"polycade.game",defaultOptions:{viewport:{},ui:{}},prep:function(e){return e=this.prepOptions(e),this.id=s.guid(),this.prepHandlers(e),this.prepUI(e.ui),this.prepViewport(e.viewport),this.prepPhaser(e.phaser),this.deferred=a.defer(),this.deferred.promise.then(this.handlers.ready)},prepEntities:function(e){this.entities={},this.entities.shadow=r.entities.shadow.namespace(e),this.entities.base=r.entities.base.namespace(e)},prepPhaser:function(){this.phaser=new i.Game(100,100,i.AUTO,this.container[0],this.phaserHandlers,!0,!0)},prepUI:function(){this.container=t(this.options.container)},prepHandlers:function(){this.handlers=s.bindCollection(this.handlers,this),this.phaserHandlers=s.bindCollection(this.phaserHandlers,this)},prepManagers:function(e){this.managers={},this.managers.events=r.managers.events.namespace(e),this.managers.screens=r.managers.screens.namespace(e),this.managers.assets=r.managers.assets.namespace(e),this.events=this.managers.events.create(),this.screens=this.managers.screens.create(),this.assets=this.managers.assets.create()},prepViewport:function(){this.viewport||(this.viewport={element:window},this.viewport.width=n.viewportW(),this.viewport.height=n.viewportH(),this.viewport.ratio=this.viewport.width/this.viewport.height,this.viewport.element.addEventListener("resize",this.handlers.resize))},handlers:{ready:function(){var e={game:this,phaser:this.phaser};this.prepEntities(e),this.prepManagers(e),this.screens.fetch("construction-puzzle").then(function(t){e.game.currentScreen=t,t.enable(),e.game.handlers.resize()})},resize:function(){this.viewport.width=n.viewportW(),this.viewport.height=n.viewportH(),this.viewport.ratio=this.viewport.width/this.viewport.height,this.phaser.scale.setGameSize(this.viewport.width,this.viewport.height),this.phaser.world.setBounds(0,0,Math.max(this.viewport.width,this.dims.width),Math.min(this.viewport.height,this.dims.height))}},phaserHandlers:{preload:function(){},create:function(){this.deferred.resolve(this)},update:function(){},render:function(){}},globalPosition:function(e){return e&&e.sprite?e.sprite.position:new i.Point(0,0)}}),r.game}),async("polycade.imagination.body",["underscore","Phaser","theory","PolyK"],function(e,t,s,i){var n=async.ref("polycade",{});return n.imagination=n.imagination||{},n.imagination.body=n.base.mix(n.imagination.body,{prep:function(e){this.options=e},debugDraw:function(s,i){this.options.source&&e.each(this.options.source.shapes,function(e,n){var a,r=new t.Polygon(e.points);a=s.add.graphics(i.position.x,i.position.y),a.scale=i.scale,a.alpha=.3,a.beginFill(16724991),a.drawPolygon(r.points),a.endFill()})},collide:function(){}}),n.imagination.body}),async.registry("polycade",{src:{jq:{file:"node_modules/jqlite/jqlite.js",resolve:function(){return jqlite}},underscore:{file:"node_modules/underscore/underscore-min.js",resolve:function(){return _}},Phaser:{file:"node_modules/phaser/build/phaser.min.js",resolve:function(){return Phaser}},PolyK:{file:"vendor/polyk/polyk.js",resolve:function(){return PolyK}},verge:{file:"vendor/verge/verge.min.js",resolve:function(){return verge}},defiant:{file:"node_modules/defiant/dist/defiant.min.js",resolve:function(){return Defiant}},q:{resolve:function(){return async.promiser}},"polycade.events":{file:"src/managers/polycade.events.js",asynced:!0},"polycade.screens":{file:"src/managers/polycade.screens.js",asynced:!0},"polycade.assets":{file:"src/managers/polycade.assets.js",asynced:!0},"polycade.base":{file:"src/polycade.base.js",asynced:!0},"polycade.game":{file:"src/polycade.game.js",asynced:!0},"polycade.entities.base":{file:"src/polycade.entities.base.js",asynced:!0},"polycade.entities.shadow":{file:"src/polycade.entities.shadow.js",asynced:!0},"polycade.entities.adornment":{file:"src/polycade.entities.adornment.js",asynced:!0},"polycade.controllers.user":{file:"src/polycade.controllers.user.js",asynced:!0},"polycade.imagination.body":{file:"src/polycade.imagination.body.js",asynced:!0}},build:{jq:{file:"node_modules/jqlite/jqlite.min.js",resolve:function(){return jqlite}},underscore:{file:"node_modules/underscore/underscore-min.js",resolve:function(){return _}},Phaser:{file:"node_modules/phaser/build/phaser.min.js",resolve:function(){return Phaser}},PolyK:{file:"vendor/polyk/polyk.js",resolve:function(){return PolyK}},verge:{file:"vendor/verge/verge.min.js",resolve:function(){return verge}},defiant:{file:"node_modules/defiant/dist/defiant.min.js",resolve:function(){return Defiant}},q:{resolve:function(){return async.promiser}},"polycade.events":{asynced:!0},"polycade.screens":{asynced:!0},"polycade.assets":{asynced:!0},"polycade.base":{asynced:!0},"polycade.game":{asynced:!0},"polycade.entities.base":{asynced:!0},"polycade.entities.shadow":{asynced:!0},"polycade.entities.adornment":{asynced:!0},"polycade.controllers.user":{asynced:!0},"polycade.imagination.body":{asynced:!0}}}),async("polycade",["jq","theory","underscore"],["polycade.base","polycade.game"],function(e,t,s){var i=async.ref("polycade",{});return i=i.base.mix(i,{})}),async("polycade.assets",["underscore","theory","Phaser","q"],function(e,t,s,i){var n=async.ref("polycade",{});return n.managers=n.managers||{},n.managers.assets=t.base.mix(n.managers.assets||{},{load:function(e){return Q.defer().promise}}),n.managers.assets}),async("polycade.events",["jq","theory","Phaser","underscore"],function(e,t,s,i){var n=async.ref("polycade",{});n.managers=n.managers||{};var a;return n.managers.events=t.base.mix(n.managers.events||{},a={createFrom:function(e){return i.extend(e,a)},prep:function(e){return e=e||{},this},splitNames:function(e){return e.split(" ")},on:function(e,t,s,n,a){return i.each(this.splitNames(e),this.onEach,{events:this,handler:[t,s,n,a]}),this},off:function(e,t,s){return i.each(this.splitNames(e),this.offEach,{events:this,handler:[t,s]}),this},onEach:function(e){return!this.events[e]&&(this.events[e]=new s.Signal),this.events[e].add.apply(this.events[e],this.handler),this},offEach:function(){return this.events[name]&&this.events[name].remove.apply(this.events[name],this.handler),this},trigger:function(e,t){return this[e]&&this[e].dispatch(t),this},extend:function(e){for(var t in e)e[t]&&e[t].call&&this.on(t,e[t],this)}}),n.managers.events}),async("polycade.screens",["underscore","theory","Phaser","q","defiant"],function(e,t,s,i,n){var a=async.ref("polycade",{});return a.managers=a.managers||{},t.navigate=t.base.mix({},{prep:function(e){this.i={},this.i.targets=e.join?e:[e],this.chained=this.chained?Object.create(this.chained):{},this.chained.stored=this.chained.stored?this._reinstanceStored():[],this.chained.withRecall=this.chained.withRecall||!1,this.chained.allowDuplicates=this.chained.allowDuplicates||!1},allowDuplicates:function(){return this.chained.allowDuplicates=!0,this},search:function(t){var s,i=[],n=[];return e.each(this.i.targets,function(a,r){var o=JSON.search(a,t);s=i.length,o&&(i=this.chained.allowDuplicates?i.concat(o):e.union(i,o)),this._extendStored(n,this.chained.stored[r],i.length-s)},this),this.create(i)._setStored(n)},store:function(t,s,i){return i=i||this,e.each(this.i.targets,function(e,n){this.chained.stored[n]||(this.chained.stored[n]={}),this.chained.stored[n][t]=s&&s.call?s.call(i,e,n):void 0!==s?s:e},this),this},children:function(){},each:function(t,s,i){return s=s||this,e.each(this.i.targets,function(e,n){this.chained.withRecall?t.apply(s,[e,n,this.chained.stored[n]].concat(i)):t.apply(s,[e,n].concat(i))},this),this},enableRecall:function(){return this.chained.withRecall=!0,this},disableRecall:function(){return this.chained.withRecall=!1,this},_extendStored:function(e,t,s){if(!t)return this;for(var i=0;i<s;i++)e.push(t);return this},_reinstanceStored:function(){var t,s=this.chained.stored.length,i=[];for(t=0;t<s;t++)i[t]=e.extend({},this.chained.stored[t]);return i},_setStored:function(e){return this.chained.stored=e,this},eachOwn:function(t,s){var i,n=[],a=[];return s=s||this,e.each(this.i.targets,function(r,o){var h=e.map(r,function(e,i){return t.call(s,e,i),e});i=n.length,h&&(n=this.chained.allowDuplicates?n.concat(h):e.union(n,h)),this._extendStored(a,this.chained.stored[o],n.length-i)},this),this.create(n)._setStored(a)},mapOwn:function(t,s){var i,n=[],a=[];return s=s||this,e.each(this.i.targets,function(r,o){var h=e.map(r,t,s);i=n.length,h&&(n=this.chained.allowDuplicates?n.concat(h):e.union(n,h)),this._extendStored(a,this.chained.stored[o],n.length-i)},this),this.create(n)._setStored(a)},log:function(e){return e?console.log(e.apply(this)):console.log(this.i.targets),this}}),t.collectionNamed=t.base.mix({},{prep:function(){this.i={},this.i.items={},this.events={},this.events.added=new s.Signal,this.events.removed=new s.Signal},add:function(e,t){this.i.items[e]||(this.i.items[e]=t),this.events.added.dispatch(e,t)},remove:function(){this.i.items[name]&&delete this.i.items[name],this.events.removed.dispatch(name)},get:function(){return this.i.items}}),a.screen=t.base.mix(a.screen||{},{prep:function(e){if(e.game&&(this.game=e.game),!this.game)throw new Error("please define a game property an instance of polycade.game");this.phaser=this.game.phaser,this.name=e.name,this.groups=t.collectionNamed.create(),this.adornments=t.collectionNamed.create(),this.baseGroup=new s.Group(this.phaser),this.baseGroup.visible=!1,this.handlers=t.bindCollection(this.handlers,this),this.groups.events.added.add(this.handlers.groupAdded)},handlers:{groupAdded:function(e,t){this.parseGroup(t)}},enable:function(){this.baseGroup.visible=!0},disable:function(){this.baseGroup.visible=!1},parseGroupItem:function(e){e.sprite&&t.merge(e,{sprite:{group:this.baseGroup}}),e.shadow&&t.merge(e,{shadow:{group:this.baseGroup}}),console.log("parseGroupItem",e),this.game.entities.base.create(e)},parseGroup:function(e){e.element=new s.Group(this.phaser),this.baseGroup.add(e.element);t.navigate.create(e.json).search("*/items").each(function(e){var s={};e["@internal"]&&(e=e["@internal"]),t.merge(s,e),this.parseGroupItem(s)},this)},loadFromJSON:function(e,t){if(!e.definitions)throw new Error("unexpected format of JSON");return Q.Promise(this["loadFromJSON.Promise"]({json:e,baseURI:t,loader:new s.Loader(this.phaser)})).then(this["loadFromJSON.dataComplete"]())},"loadFromJSON.Promise":function(t){return e.bind(function(s,i){this["loadFromJSON.jsonPreprocess"](t),t.resolve=s,t.reject=i,t.loader.onLoadComplete.add(this["loadFromJSON.externalsComplete"](t)),t.loader.onFileError.add(this["loadFromJSON.externalsFailed"](t)),t.externalRefs=JSON.search(t.json,'//*[@ref and not(starts-with(@ref,"#"))]'),t.externalFiles={},e.each(t.externalRefs,this["loadFromJSON.eachDataPath"](t)),t.loader.start()},this)},"loadFromJSON.jsonPreprocess":function(e){t.navigate.create(e.json).allowDuplicates().search("//*[id]").store("id").search("//*[@ref]").enableRecall().each(function(e,t,s){e["@ids"]?e["@ids"].push(s.id.id):e["@ids"]=[s.id.id]})},"loadFromJSON.externalsComplete":function(t){return e.bind(function(){var s=this;Q.all(e.map(t.externalFiles,this["loadFromJSON.eachExternalFile"](t))).then(function(){s.json=t.json,t.internalRefs=JSON.search(t.json,"//*[@ref]"),t.internalRefs.length&&e.each(t.internalRefs,function(e){var t,i=e["@ref"].substr(1);i=i.replace(/([^\/]+\-[^\/]+)/gi,'*[@d:name="$1"]/d:item'),i=i.replace(/^#\//,""),i="/*"+i,(t=JSON.search(s.json,i))&&(e["@internal"]=t)}),t.internalRefs.length&&console.log("internal refs",t.internalRefs),t.resolve(s)})},this)},"loadFromJSON.externalsFailed":function(t){return e.bind(function(){t.reject(this)},this)},"loadFromJSON.eachDataPath":function(t){return e.bind(function(e,s){var i,n=this.jsonRefToPathItem(e);t.externalFiles[n.path]?(i=t.externalFiles[n.path],i.jsonRef.join?(i.jsonRef.push(n.jsonRef),i.fragment.push(n.fragment)):(i.jsonRef=[i.jsonRef,n.jsonRef],i.fragment=[i.fragment,n.fragment])):t.externalFiles[n.path]=n,console.log("loading",n.type,n.path),t.loader[n.type](n.path,n.path)},this)},"loadFromJSON.mergeExternalFragment":function(t,s,i){if(i){var n=String(i),a=JSON.search(s,'//*[id="#'+n+'"]',!0);if(a&&a[0])e.extend(t,a[0]);else{n=n.replace(/([^\/]+\-[^\/]+)/gi,'*[@d:name="$1"]/d:item');var a=JSON.search(s,"//"+n,!0);if(!a||!a[0])throw new Error("unable to find fragment",i);e.extend(t,a[0])}}else e.extend(t,s);delete t["@ref"]},"loadFromJSON.eachExternalFile":function(t){return e.bind(function(e){var t;switch(e.type){case"json":if(e.json=this.phaser.cache.getJSON(e.path),e.jsonRef.join)for(t=0;t<e.jsonRef.length;t++)this["loadFromJSON.mergeExternalFragment"](e.jsonRef[t],e.json,e.fragment[t]);else this["loadFromJSON.mergeExternalFragment"](e.jsonRef,e.json,e.fragment);return Q.Promise(this["loadFromJSON.Promise"]({json:e.json,baseURI:e.path,loader:new s.Loader(this.phaser)}));case"image":if(e.image=this.phaser.cache.getImage(e.path),e.jsonRef.join)for(t=0;t<e.jsonRef.length;t++)e.jsonRef[t].cacheName=e.path,e.jsonRef[t].image=e.image,delete e.jsonRef[t]["@ref"];else e.jsonRef.cacheName=e.path,e.jsonRef.image=e.image,delete e.jsonRef["@ref"];return Q.when(e)}return Q.when(!0)},this)},"loadFromJSON.dataComplete":function(){return e.bind(function(){try{console.log(this.json);t.navigate.create(this.json).search("/*/definitions/*").search("/*/groups").eachOwn(function(e,t){this.groups.add(t,{json:e})},this)}catch(e){console.log(e)}return console.log(this.groups.get()),this},this)},parseURL:function(e){var t,s,i,n=document.createElement("a"),a={};for(n.href=e,t=n.search.replace(/^\?/,"").split("&"),i=0;i<t.length;i++)s=t[i].split("="),a[s[0]]=s[1];return{protocol:n.protocol,host:n.host,hostname:n.hostname,port:n.port,pathname:n.pathname,search:n.search,searchObject:a,hash:n.hash}},jsonRefToPathItem:function(e){var t,s,i=e["@ref"],n=i,a="";switch(0===i.indexOf("data://")?(t=i.replace("data://","/assets/data/").split("#"),type="unknown",n=t[0],a=t[1]):e["@ids"]?(n=e["@ids"].join("").replace("data://","http://none/assets/data/"),t=this.parseURL(n),s=t.pathname.lastIndexOf("/"),n=t.pathname.substring(0,s)+"/"+i):n="unknown",!0){case i.indexOf(".json")!=-1:type="json";break;case i.indexOf(".png")!=-1:case i.indexOf(".jpg")!=-1:case i.indexOf(".jpeg")!=-1:type="image"}return{type:type,jsonRef:e,path:n.replace(/^\//,""),fragment:a}},load:function(e,t){var i=this.create({name:t,game:e}),n=new s.Loader(i.phaser);return Q.Promise(function(e,s){n.onLoadComplete.add(function(){i.loadFromJSON(i.phaser.cache.getJSON(t)).then(e).catch(s)}),n.onFileError.add(function(){s(i)}),n.json(t,"assets/data/screens/"+t+".json?nc="+(new Date).getTime()),n.start()})},trash:function(){}}),a.managers.screens=t.base.mix(a.managers.screens||{},{prep:function(e){e=this.options=e||{},this.game=this.game||e.game,this.entities={},this.entities.screen=a.screen.namespace(),this.handlers=t.bindCollection(this.handlers,this),this.cache={},this.promises={},this.phaser=this.game.phaser},fetch:function(e){return this.cache[e]?(this.promises[e]||(this.promises[e]=Q.when(this.cache[e])),this.promises[e]):this.promises[e]?this.promises[e]:(this.promises[e]=this.entities.screen.load(this.game,e).then(this.handlers.screenLoaded),this.promises[e])},unfetch:function(e){this.cache[e].trash(),delete this.promises[e],delete this.cache[e]},handlers:{screenLoaded:function(e){return this.cache[name]=e}}}),a.managers.assets});