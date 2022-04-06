const crypto = require('crypto');
const prompt = require('prompt-sync')();
let userChoose;
let compChoose;
let result;


class KeyHash {
    secret;
    numValue;
    algorithm = 'sha256';
    key;
    chooseComp;
    hash;
    hmac;
    constructor(numberValue, choose) {
        this.chooseComp = numberValue.get(choose)
        this.numValue = String(numberValue.size);
        this.key = this.keyCalc();
        this.hash = this.hashCalc();
    }

    keyCalc() {
        let min = Math.ceil(1000000000);
        let max = Math.floor(1000000000000000000);
        this.secret = String(Math.floor(Math.random() * (max - min)) + min);
        this.hmac = crypto.createHmac(this.algorithm, this.secret);
        this.hmac.write(this.numValue);
        this.hmac.end();
        return this.hmac.read().toString('hex')
    }
    
    hashCalc() {
        this.hmac = crypto.createHmac(this.algorithm, this.key);
        this.hmac.write(this.chooseComp);
        this.hmac.end();
        return this.hash = this.hmac.read().toString('hex');
 }
}

class winLoseDraw{
    moves;
    result;
    constructor(size, userCh, compCh) {
        size.delete(0);
        size.delete("?");
        this.moves = Math.floor(size.size / 2);
        if (userCh == compCh) {
            this.result = 0;
        } else if (userCh > compCh) {
            if ((userCh - compCh) <= this.moves) {
                this.result = -1;
            } else {
                this.result = 1;
            }
            
        } else if ((compCh - userCh) <= this.moves) {
            this.result = 1;
        } else {
            this.result = -1;
        }
        
    }

    getResult() {
        if (this.result == 0) {
            return "Draw...";
        } else if (this.result == 1) {
            return "Win!";
        } else {
            return "Lose!";
        }
    }
}

class TableHelp{
    tableMap = {};
    result;
    constructor(maps) {
        maps.delete(0);
        maps.delete("?");
        maps.forEach((value, key) => {
            this.tableMap[value] = {};
            for (let i = 1; i <= maps.size; i++) {
                if (key == i) {
                    this.result = "Draw";
                } else if (key > i) {
                    if ((key - i) <= ((maps.size-1)/2)) {
                        this.result = "Lose";
                    } else {
                        this.result = "Win";
                    }
                    
                } else if ((i - key) <= ((maps.size-1)/2)) {
                    this.result = "Win";
                } else {
                    this.result = "Lose";
                }
                this.tableMap[value][maps.get(i)] = this.result;
            }
        });

    }

}

function splitString(stringToArray) {
    arr = Array.from(new Set(stringToArray));
    if (arr.length != stringToArray.length) {
        return false;
    }
    let movesMap = new Map();
    let j=1;
    for (let i = 0; i < arr.length; i++){
        movesMap.set(j, arr[i]);
        j++;
    }
    return movesMap;
}
let userMoveMap = splitString(process.argv.slice(2));

function chooseComputer(size) {
    min = Math.ceil(1);
    max = Math.floor(size);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function menuBuild(map) {
    let size = map.size;
    map.set(0, "exit").set("?", "Help");
    
    let text = `Available moves:
    `;

    map.forEach((value, key, map) => {
    text += `${key} - ${value}
    `;
    });

    return text;

}

function userChooseCheck(choose) {
        if (choose == "?") {
            return "?";
        } else {
            return Number(choose);
        }
}

try {
    if (!userMoveMap) {
        throw new SyntaxError("You entered duplicate parameters");
    }
    if (!userMoveMap.size) {
        throw new SyntaxError("You don't enter any parameters! Enter no less 3 parameters!");
    }
    
    if (userMoveMap.size % 2 == 0) {
        throw new SyntaxError("You entered odd number of parameters!");
    }

    if (userMoveMap.size == 1) {
         throw new SyntaxError("You entered only one parameter! Enter no less 3 parameters!");
    }

    compChoose = chooseComputer(userMoveMap.size);
    let key = new KeyHash(userMoveMap, compChoose);
    let textHmac = "HMAC: "+key.hash;
    let textKey = "HMAC key: " + key.key;

    
    console.log(textHmac);
    console.log(menuBuild(userMoveMap));
    userChoose = userChooseCheck(prompt('Enter your move: '));
    if (userChoose == 0) {
        throw new SyntaxError("You decided to exit. Good luck!");
    } else if (userChoose == "?") {
        let table = new TableHelp(userMoveMap);
        console.table(table.tableMap);
        process.exit(-1);
    } else if (isNaN(userChoose)) {
        throw new SyntaxError('Enter a number of your choose or "?"');
    } else if (userChoose < 0 || userChoose > userMoveMap.size-2) {
        throw new SyntaxError('Enter a valid number!');
    }

    result = new winLoseDraw(userMoveMap, userChoose, compChoose);
    console.log("Your move: ", userMoveMap.get(userChoose));
    console.log("Computer move: ", userMoveMap.get(compChoose));
    
    if (result.result) {
        console.log("You", result.getResult());
    } else {
        console.log("Uppss...", result.getResult());
    }

    console.log(textKey);

} catch (err) {
        console.log(err.message);
}