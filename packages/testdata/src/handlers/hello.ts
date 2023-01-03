import { register } from '../handler';

register('/hello.json', () => {
  return {
    updated: '2023-01-03T01:02:03',
    info: {
      name: 'Hello Announcing',
    },
    posts: [
      {
        count: 10,
        href: 'hello.1.json',
      },
    ],
  };
});
