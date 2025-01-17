import cluster from 'node:cluster';
import { cpus } from 'node:os';
import process from 'node:process';

const numCPUs = cpus().length;

/**
 * Determine your total CPU to create certain threads to improve the performance
 */
export const clusterize = (callback: () => Promise<void>) => {
    if (cluster.isPrimary) {
        console.log(`Master server started`);
        for (let i = 0; i < numCPUs; i += 1) {
            cluster.fork();
        }
        cluster.on('exit', (worker) => {
            console.log(`Worker ${worker.process.pid} died. Restarting`);
            cluster.fork();
        });
    } else {
        console.log(`Cluster server started on ${process.pid}`);
        callback();
    }
};