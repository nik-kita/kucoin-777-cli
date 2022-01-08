/* eslint-disable no-await-in-loop */
import Redis from 'ioredis';
import prompts from 'prompts';

(async () => {
    const pub = new Redis({ db: 7 });
    const sub = pub.duplicate();

    await sub.subscribe('from:ws:main', 'from:processor:main');
    await pub.publish('to:ws', 'open');

    sub.on('message', (channel, message) => {
        console.log(channel, message);
    });

    while (true) {
        const { value } = await prompts({
            type: 'select',
            name: 'value',
            message: 'Send command:',
            choices: [
                { title: 'to:ws:open', value: 'to:ws:open' },
                { title: 'to:ws:close', value: 'to:ws:close' },
                { title: 'from:root:exit', value: 'from:root:exit' },
            ],
            initial: 1,
        });

        if (value === 'to:ws:open') {
            await pub.publish('to:ws', 'open');
        } else if (value === 'to:ws:close') {
            await pub.publish('to:ws', 'close');
        } else if (value === 'from:root:exit') {
            await pub.publish('from:root', 'exit');
            pub.disconnect();
            process.exit(0);
        }
    }
})();
