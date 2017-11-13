# avocado

## Installation

1. Install Truffle globally.
    ```bash
    npm install -g truffle
    ```

2. Download the box. This also takes care of installing the necessary dependencies.
    ```bash
    truffle unbox adrianmcli/truffle-next
    ```

3. Run the development console.
    ```bash
    truffle develop
    ```

4. Compile and migrate the smart contracts. Note inside the development console we don't preface commands with `truffle`.
    ```bash
    compile
    migrate
    ```

5. Run the next.js server for the front-end. Smart contract changes must be manually recompiled and migrated.
    ```bash
    // Change directory to the front-end folder
    cd client
    // Serves the front-end on http://localhost:3000
    npm run dev
    ```

6. Truffle can run tests written in Solidity or JavaScript against your smart contracts. Note the command varies slightly if you're in or outside of the development console.
    ```bash
    // If inside the development console.
    test

    // If outside the development console..
    truffle test
    ```
