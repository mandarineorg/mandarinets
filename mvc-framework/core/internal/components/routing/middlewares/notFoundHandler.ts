export default ({ response }) => {
    response.status = 404;
    response.body = { msg: "Not Found" };
};