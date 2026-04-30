Code sent by team member, because he does not want to rewrite their code 

```js
const net = require('net');

const server = net.createServer((socket) => {
    // Pre-allocate a large buffer for the JPEG (e.g., 5MB)
    // and an index to track where we are.
    let stagingBuffer = Buffer.alloc(5 * 1024 * 1024); 
    let writeIndex = 0;
    let expectedSize = -1;

    // Start the loop
    socket.write(Buffer.from([0x01]));

    socket.on('data', (chunk) => {
        // 1. Copy the incoming chunk into our staging buffer at the current index
        // This is the "memcpy" equivalent
        chunk.copy(stagingBuffer, writeIndex);
        writeIndex += chunk.length;

        // 2. Check if we have at least the header
        if (expectedSize === -1 && writeIndex >= 4) {
            expectedSize = stagingBuffer.readUInt32BE(0);
        }

        // 3. Check if we have the full image
        if (expectedSize !== -1 && writeIndex >= (expectedSize + 4)) {
            // "Work directly" with the slice of the buffer
            const finalJpeg = stagingBuffer.subarray(4, 4 + expectedSize);
            
            console.log("Full JPEG received. Size:", finalJpeg.length);

            // 4. Reset for the next image
            // If there was leftover data (start of next packet), move it to the front
            const leftover = writeIndex - (4 + expectedSize);
            if (leftover > 0) {
                stagingBuffer.copy(stagingBuffer, 0, 4 + expectedSize, writeIndex);
                writeIndex = leftover;
            } else {
                writeIndex = 0;
            }
            expectedSize = -1;

            // Trigger next loop
            socket.write(Buffer.from([0x01]));
        }
    });
});

server.listen(8080);
```

```js

const net = require('net');
const dgram = require('dgram');

// --- TCP SERVER (Core 0: Camera Feed) ---
const tcpServer = net.createServer((socket) => {
    console.log('ESP32 TCP Connected');

    let stagingBuffer = Buffer.alloc(1024 * 1024); 
    let writeIndex = 0;
    let expectedSize = -1;

    // Helper to send commands to the ESP32
    const sendCommand = (cmd) => {
        if (socket.writable) {
            socket.write(Buffer.from(cmd)); 
            console.log(`Sent command: ${cmd}`);
        }
    };

    // Example: Start the camera immediately
    sendCommand('G');

    socket.on('data', (chunk) => {
        chunk.copy(stagingBuffer, writeIndex);
        writeIndex += chunk.length;

        // Process Header (4 bytes UINT32)
        if (expectedSize === -1 && writeIndex >= 4) {
            expectedSize = stagingBuffer.readUInt32BE(0);
        }

        // Process Payload (JPEG)
        if (expectedSize !== -1 && writeIndex >= (expectedSize + 4)) {
            const jpegData = stagingBuffer.subarray(4, 4 + expectedSize);
            
            // --- DRAW / SAVE JPEG HERE ---
            console.log(`JPEG Received: ${jpegData.length} bytes`);

            // Shift leftover data
            const leftover = writeIndex - (4 + expectedSize);
            if (leftover > 0) {
                stagingBuffer.copy(stagingBuffer, 0, 4 + expectedSize, writeIndex);
                writeIndex = leftover;
            } else {
                writeIndex = 0;
            }
            expectedSize = -1;

            // Note: We DON'T auto-send 'G' here. 
            // The ESP32 waits for your command based on your app logic.
        }
    });
});

// --- UDP SERVER (Core 1: Motion Detection) ---
const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg, rinfo) => {
    if (msg.length === 4) {
        const motionDiff = msg.readUInt32BE(0);
        console.log(`[UDP] Motion Diff: ${motionDiff}`);
        
        // No response sent here as per your request.
    }
});

// --- UI / INTERACTION ---
// You can hook this up to a terminal input to control the ESP32 live
process.stdin.on('data', (data) => {
    const key = data.toString().trim().toUpperCase();
    if (['G', 'S', 'N', 'M'].includes(key)) {
        // You would need to store the 'socket' reference to use it here
        // e.g., global.espSocket.write(key);
    }
});

tcpServer.listen(8080);
udpServer.bind(8081);
```
