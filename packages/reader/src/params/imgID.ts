const regex = /^[A-Za-z0-9_-]{43}_[0-9]{1,4}x[0-9]{1,4}\.(png|jpg|webp)$/;

export const match = (param: string) => {
  return param.match(regex) !== null;
};
