var async=function(){return async.def.apply(this,arguments)};String(window.location).indexOf("debug")!=-1&&(async.log=function(){var e=Array.prototype.slice.call(arguments);return e.unshift("async","--"),console.log.apply(console,e)}),async.tmp={},async.promiser=Q||Promise||Q,async.registry=function(e){var n,r,s;if(this.registry._||(this.registry.waiting={},this.registry._={}),2==arguments.length){if(!(r=async.registry.get(e)))throw new Error("missing base for "+e);if(!r.base)throw new Error("base property missing from base");if(e=arguments[1],r.use){if(!e[r.use])throw new Error("unimplemented use value "+r.use);e=e[r.use]}for(n in e)Object.prototype.hasOwnProperty.call(e,n)&&(s=e[n],s.file&&(s.path=r.base+s.file),this.registry.add(n,s))}else if(Object.assign)Object.assign(this.registry._,e);else for(n in e)Object.prototype.hasOwnProperty.call(e,n)&&this.registry.add(n,e[n])},async.defer=function(){var e,n,r,s=async.promise(function(s,t,a){e=s,n=t,r=a});return e&&(s.resolve=e),n&&(s.reject=n),r&&(s.notify=r),s},async.promise=function(e){return async.promiser.Promise?async.promiser.Promise(e):new async.promiser(e)},async.registry.get=function(e){return this._[e]||null},async.registry.add=function(e,n){if(this._[e]=n,async.log&&async.log("adding registry data for",e),this.waiting[e])for(var r=0,s=this.waiting[e].length;r<s;r++)this.waiting[e][r]()},async.def=function(e){async.log&&async.log("async()",e);var n,r,s,t,a,o=arguments,i=async.storeOrReference(e);for(i.def=e,i.list=[],i.names=[],i.asynced=!0,i.addScript=async.addScript,i.addDependency=async.addDependency,i.thens=[],i.defBeforeAdded=!i.added,Array.prototype.shift.call(o),n=0,r=o.length;n<r&&(t=o[n]);n++)if(t.apply)i.thens.push(t);else if(t.split)i.addDependency(t);else if(t.join)for(s=0;s<t.length;s++)a=async.registry.get(t[s]),a?i.addDependency(t[s],a):i.addDependency(t[s]);else for(s in t)Object.prototype.hasOwnProperty.call(t,s)&&i.addDependency(s,t[s]);for(async.log&&async.log("async.def",i.def,"queue created from",i.list.length,"dependencies",i.names,i.list),i.q=async.promiser.all(i.list),n=0,r=i.thens.length;n<r&&(t=i.thens[n]);n++)i.q=i.q.then(function(){return t.apply(this,arguments[0])});return i.q=i.q.then(function(){if(console.log(i.def,"HERE!!!",i.dependencies),i.dependencies){if(async.log){for(var e={},n=0;n<i.names.length;n++)e[i.names[n]]=async.storeOrReference(i.names[n]);async.log("resolving entire dependency chain for",i.def,"as",e)}i.dependencies.deferred.notify&&i.dependencies.deferred.notify(arguments),i.dependencies.deferred.resolve.apply(i.dependencies.deferred,arguments)}return arguments[0]}),i.q=i.q.catch(function(e){throw i.dependencies&&(i.dependencies.deferred.notify("rejected"),i.dependencies.deferred.reject(e)),e}),async.log&&(i.q=i.q.then(function(e){return async.log("full completion for script",i.def,e),e})),i.q},async.ref=function(e,n,r){return async.ref.list||(async.ref.list={}),(void 0===async.ref.list[e]||r)&&(async.ref.list[e]=n),async.ref.list[e]||n},async.storeOrReference=function(e){var n;return async.store||(async.store={}),(n=async.store[e])?async.log&&async.log("referencing",e,n):(n=async.store[e]={},async.log&&async.log("storing",e)),n},async.addScript=function(e,n){var r,s,t,a=this.list;async.log&&async.log("adding/referencing script",e),t=async.storeOrReference(e),t.added=!0,t.loading||(n&&(n.asynced?(t.asynced=!0,t.resolve=n.resolve):(t.asynced=!1,t.resolve=n.resolve||async.resolver(e)),t.path=n.substr?n:n.path),t.waiting||(r=s=async.load(),r=r.then(function(){return t.defBeforeAdded?(async.log&&async.log("not waiting (2) for dependencies for",e),null):t.asynced?(async.log&&async.log("waiting for dependencies for",e),t.dependencies={deferred:async.defer()},console.log(e,t.dependencies.deferred,t.dependencies.deferred.resolve),t.dependencies.deferred):(async.log&&async.log("not waiting for dependencies for",e),null)}),async.log&&(r=r.then(function(){return async.log("about to trigger the resolve for",e),arguments[0]})),r=r.then(function(){return t.resolve?async.log&&async.log("resolving using function",e):async.log&&async.log("resolving using return value",e),t.resolve?t.resolve():arguments[0]}),r=r.then(function(n){return async.log&&async.log("resolved for",e,"as",Array.prototype.slice.call(arguments,0)),t.resolved=!0,async.ref(e,n,!0),n}),t.loader=r,t.originalLoader=s,a.push(t.q||r)),n?(t.waiting=!1,t.loading=!0,t.path?t.originalLoader.url(t.path):(async.log&&async.log("no path so auto-resolving",e),t.originalLoader.resolve())):t.waiting=!0)},async.addDependency=function(e,n){var r=this,s=async.storeOrReference(e);if(s.loader&&!s.waiting){if(this.q)return void(async.log&&async.log("queue already created, cannot update dependency (1)",e,"for",this.def));async.log&&async.log("adding dependency (1)",e,"for",this.def),this.list.push(s.q||s.loader),this.names.push(e)}else if(n)if(async.log&&async.log("adding dependency (2)",e,"for",this.def),n.join){!this.q&&this.names.push(e);for(var t=0;t<n.length;t++)this.addScript(n[t],n[t])}else this.addScript(e,n),!this.q&&this.names.push(e);else s.waiting?(async.log&&async.log("already waiting for dependency",e,"for",this.def),this.list.push(s.q||s.loader)):(async.log&&async.log("waiting for dependency",e,"for",this.def),this.addScript(e)),async.registry.waiting[e]||(async.registry.waiting[e]=[]),async.registry.waiting[e].push(function(){var n=async.registry.get(e);if(async.log&&async.log("waiting ended for dependency",e),!n)throw new Error("after waiting, data still not available for"+e);r.addDependency(e,n)})},async.resolver=function(e){return function(){return function(){return this}()[e]}},async.load=function(e){var n,r,s,t=async.promise(function(e,t,a){n=function(){async.log&&async.log("script resolved"),e()},r=function(){async.log&&async.log("script rejected"),t()},s=function(n){var r;return document.querySelector&&(r=document.querySelector('script[src="'+n+'"]'))?e(r):(r=document.createElement("script"),r.type="text/javascript",r.readyState?r.onreadystatechange=function(){"loaded"!=r.readyState&&"complete"!=r.readyState||(async.log&&async.log("script loaded (ie)",n),r.onreadystatechange=null,e(r))}:r.onload=function(){async.log&&async.log("script loaded",n),e(r)},r.src=n,(document.documentElement||document.body).appendChild(r),async.log&&async.log("injected script tag for",n),null)}});return t.resolve=n,t.reject=r,t.url=s,e&&t.url(e),t};