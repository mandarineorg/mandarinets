export default async ({ response }, nextFn) => {
    try {
      await nextFn();
    } catch (err) {
      response.status = 500;
      response.body = { msg: err.message };
    }
};