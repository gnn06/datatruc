import { combineLatest, from, map, Observable, Subject } from 'rxjs';
     
// const foo = new Observable((subscriber) => {
//   console.log('Hello');
//   subscriber.next(Math.random());
//   subscriber.next('world');
//   subscriber.complete();
// });

// // const foo = from([1, 2, 3]);

// foo.subscribe((x) => {
//   console.log(x);
// });
// console.log('between subscribe');
// foo.subscribe({
//   next : (x) => { console.log('next', x) },
//   complete : () => { console.log('done') }
// });

const subject1 = new Subject();
const subject2 = new Subject();
const subject4 = new Subject();

const subject3 = combineLatest([subject1, subject2]).pipe(
  map(([subject1, subject2]) => {
    return subject1 + subject2;
  })
);

subject3.subscribe(
  (value) => {
    console.log('subject1 + subject2 =', value);
  }
);

const subject32 = subject3.pipe(
  map((value) => {
    return value * 100;
  })
);

subject32.subscribe(
  (value) => {
    console.log('subject3 * 100 =', value);
  }
);

subject1.next(1);
subject2.next(2);
subject4.next(3);
subject1.next(2);