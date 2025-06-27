// tests/run-tests.js
import { CoreTestSuite } from './core-tests.js';

console.log('🧪 Starting Discord AI Core Test Suite...');

async function main() {
    try {
        const testSuite = new CoreTestSuite();
        await testSuite.runAllTests();
    } catch (error) {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    }
}

main();