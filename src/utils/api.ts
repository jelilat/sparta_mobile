import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://192.168.0.110:3000/',
});

export default instance;
