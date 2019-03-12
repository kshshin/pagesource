print = x => console.log( x );

const nodes = new Map( [[1,'one'], [2,'two']] );
nodes.set( 3, 'three' );
console.log( Array.from( nodes ).map( ([k, v]) => v) );

const q = x => x-1;

print( q(1) );

dad
