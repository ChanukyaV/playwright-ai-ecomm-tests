import http from 'k6/http';
import { check, sleep } from 'k6';

/*
 * SPIKE TEST - traffic jumps suddenly (flash sale), then drops. Does the app survive and recover?
 *
 *   k6 run -e PEAK=5  "sdet-interview-prep/Ep1 - types-of-testing/08-performance/shoplab-spike.js"     (tiny dry run)
 *   k6 run -e PEAK=100 "sdet-interview-prep/Ep1 - types-of-testing/08-performance/shoplab-spike.js"    (real spike)
 *
 * Base URL comes from ../../../config.json (override with -e BASE_URL=...).
 */
const config = JSON.parse(open('../../../config.json'));
const BASE_URL = (__ENV.BASE_URL || config.environments[config.activeEnvironment].baseUrl).replace(/\/+$/, '');
const PEAK = Number(__ENV.PEAK || 50);

export const options = {
  stages: [
    { duration: '10s', target: 2 },    // normal traffic
    { duration: '5s', target: PEAK },  // SPIKE
    { duration: '15s', target: PEAK }, // hold the spike
    { duration: '5s', target: 2 },     // back to normal
    { duration: '10s', target: 2 },    // recovery: is it healthy again?
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/products`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
