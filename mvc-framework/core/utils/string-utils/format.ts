export const format = (str, ...params: any[]): string => {
    var args = Array.prototype.slice.call(params, 0);
    return str.replace(/\{(\d+)\}/g, function (match, index) {
      return args[index];
    });
}