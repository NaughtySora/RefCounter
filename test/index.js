'use strict';

const assert = require("node:assert");
const { describe, it } = require("node:test");
const { RefCounter } = require("../main");

// const getCounter = (counter) => {
//   using c = counter.ref();
//   console.log("counter end", c);
// };

// {
//   // usage
//   const free = (a) => void console.log(`dispose ${JSON.stringify(a)}`, a.value = 0);
//   const smile = console.log.bind(null, "free :3");
//   const v = { value: 5 }
//   const counter = new RefCounter(v, free);
//   {
//     using a = counter.ref();
//     console.log("inner end a", a, v);
//     {
//       using b = counter.ref();
//       console.log("inner end b", b, v);
//     }
//     // counter.drop();
//     console.log("check counter ref dropped", counter.dropped);
//     getCounter(counter);
//   }
//   console.log("end", v, "check counter ref dropped", counter.dropped);
// }


// {
//   // usage
//   const free = (a) => void console.log(`dispose ${JSON.stringify(a)}`, a.value = 0);
//   const v = {
//     value: 5,
//     [Symbol.dispose](self) {
//       console.log("BOOM!");
//       this.value = Math.random();
//     }
//   };
//   const counter = new RefCounter(v, free);
//   {
//     using a = counter.ref();
//     console.log("inner end a", a, v);
//     {
//       using b = counter.ref();
//       console.log("inner end b", b, v);
//     }
//     // counter.drop();
//     console.log("check counter ref dropped", counter.dropped);
//     getCounter(counter);
//   }
//   console.log("end", v, "check counter ref dropped", counter.dropped, counter);

//   {
//     using test = v;
//   }
//   console.log(v)
// }