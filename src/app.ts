import { createServer, Socket } from 'net';

const host = process.env.HOST || 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const sockets: Socket[] = [];

(async () => {
    const server = createServer();

    server
        .listen(port, host, undefined, () => {
            process.stdout.write(`| ${host}:${port}\n`);
        })
        .on('connection', socket => {
            sockets.push(socket);

            socket
                .on('data', d => {
                    process.stdout.write(`${(new Date).toISOString()} | ${socket.remoteAddress}:${socket.remotePort} > "${d.toLocaleString()}"\n`);
                })
                .on('close', () => {
                    sockets.splice(sockets.indexOf(socket), 1);
                })
                ;
        })
        .on('error', e => {
            console.error(e.message);
            process.exit(1);
        })
        ;
})();
