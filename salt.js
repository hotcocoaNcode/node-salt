if (process.argv.length !== 3) {
    console.error('Expected \"node salt.js <filename>\"');
    process.exit(1);
}

var fs = require('fs'), filename = process.argv[2];
function execute(program){
    var registers = [0, 0, 0, 0];
    var mem = Array.apply(null, Array(4096)).map(function(){return 0;});
    var inputString = "";
    var inputStringCounter = 0;
    var current = 0;
    var instruction = 0;
    var a = 0;
    var b = 0;
    var temp = 0;
    for (registers[3] = 0; registers[3] < program.length; registers[3]++){
        temp = 0;
        current = program[registers[3]];
        // 00010000
        // iiiiaabb
        // i = 0001
        // a = 00
        // b = 00
        //                      0 1 2 3 4 5 6 7 8 9 a b c d e f
        //                      11110000
        instruction = (current & 0xf0) >> 4; //upper four bits, instruction
        //          00001100
        a = (current & 12) >> 2; //12 as 0b1100, two middle bits argument A
        //        00000011
        b = current & 3; // 3  as 0b0011, two low bits argument B
        switch (instruction) {
            case 0: return; //Exit
            case 1: //Output
                process.stdout.write(String.fromCharCode(registers[a] & 0xff));
                break;
            case 2: //Input
                registers[a] = inputString.charCodeAt(inputStringCounter++);
                break;
            case 3: //Swap
                temp = registers[a];
                registers[a] = registers[b];
                registers[b] = temp;
                break;
            case 4: //Swap from Memory
                temp = registers[a];
                registers[a] = mem[registers[b]];
                mem[registers[b]] = temp;
                break;
            case 5: //Set register to constant
                registers[3]++;
                for (var i = 0; i < 4; i++){
                    // Build constant out of next couple bytes
                    temp = temp | ((program[registers[3] + i] & 0xff) << i*8);
                }
                registers[3] += 3;
                registers[a] = temp;
                break;
            case 6: // Add
                registers[a] += registers[b];
                break;
            case 7: // Subtract
                registers[a] -= registers[b];
                break;
            case 8: // Multiply
                registers[a] *= registers[b];
                break;
            case 9: // Floor Division
                registers[a] = Math.floor(registers[a]/registers[b]);
                break;
            case 10: // Ceiling Division
                registers[a] = Math.ceil(registers[a]/registers[b]);
                break;
            case 11: // Modulo
                registers[a] %= registers[b];
                break;
            case 12: // Greater than
                registers[2] = registers[a] > registers[b] ? 1 : 0;
                break;
            case 13: // Less than
                registers[2] = registers[a] < registers[b] ? 1 : 0;
                break;
            case 14: // Equals
                registers[2] = registers[a] === registers[b] ? 1 : 0;
                break;
            case 15: // Increment/Decrement
                if (b === 1){
                    registers[a]--;
                    break;
                }
                registers[a]++;
                break;
        }
    }
}

function registerNameToNumber(name){
    // Quick utility function so this doesn't get overly repetitive.
    switch (name) {
        case "v0": return 0;
        case "v1": return 1;
        case "v2": return 2;
        case "v3": return 3;
        default: return 0;
    }
}

function instruction(number, a, b){
    // More quick utility functions to prevent dumb typos
    return number << 4 | a << 2 | b;
}

function compile(rawText){
    // Note: actually an assembler, not a compiler.
    // Maybe eventually I'll make a high-level language compile to SALT
    var filteredText = "";
    var commented = false;
    for (var i = 0; i < rawText.length; i++){
        if (!commented){
            if (rawText[i] !== ";"){
                filteredText = filteredText + rawText[i];
            } else {
                commented = true;
            }
        } else if (rawText[i] === "\n") {
            commented = false;
        }
    }
    var tokens = filteredText.replace(/\n/g, " ").split(" ");
    var program = [];
    var jumpMarkers = {};
    for (i = 0; i < tokens.length; i++){
        switch (tokens[i]) {
            case "exit":
                program.push(0);
                break;
            case "outp":
                program.push(instruction(1, registerNameToNumber(tokens[++i]), 0));
                break;
            case "inpt":
                program.push(instruction(2, registerNameToNumber(tokens[++i]), 0));
                break;
            case "swap":
                program.push(instruction(3, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "swmm":
                program.push(instruction(4, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "cnst":
                program.push(instruction(5, registerNameToNumber(tokens[++i]), 0));
                var cnstArg = tokens[++i];
                if (cnstArg in jumpMarkers){
                    cnstArg = jumpMarkers[cnstArg];
                }
                program.push( cnstArg & 0x000000ff); // Low
                program.push((cnstArg & 0x0000ff00) >> 8); // Mid low
                program.push((cnstArg & 0x00ff0000) >> 16); // Mid high
                program.push((cnstArg & 0xff000000) >> 24); // Mid high
                break;
            case "jmrk":
                jumpMarkers[tokens[++i]] = program.length - 1;
                break;
            case "iadd":
                program.push(instruction(6, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "isub":
                program.push(instruction(7, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "imul":
                program.push(instruction(8, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "idvf":
                program.push(instruction(9, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "idvc":
                program.push(instruction(10, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "imod":
                program.push(instruction(11, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "grtr":
                program.push(instruction(12, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "less":
                program.push(instruction(13, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "eqls":
                program.push(instruction(14, registerNameToNumber(tokens[++i]),
                    registerNameToNumber(tokens[++i])));
                break;
            case "incr":
                program.push(instruction(15, registerNameToNumber(tokens[++i]), 0));
                break;
            case "decr":
                program.push(instruction(15, registerNameToNumber(tokens[++i]), 1));
                break;
        }
    }
    return program;
}

fs.readFile(filename, 'utf8', function(err, fileData) {
    execute(compile(fileData));
});
