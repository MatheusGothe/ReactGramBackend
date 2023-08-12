const os = require('os-browserify');

const getCurrentIp = () => {
  try {
    const interfaces = os.networkInterfaces();
    for (let iface in interfaces) {
      const addresses = interfaces[iface];
      for (let addr of addresses) {
        if (addr.family === 'IPv4' && !addr.internal) {
          return addr.address;
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao obter endereço IP: ${error.message}`);
  }
  
  // valor padrão a ser retornado caso ocorra algum erro
  return '127.0.0.1';

};

module.exports = {
  getCurrentIp
};
