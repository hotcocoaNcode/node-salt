# node-salt
Simplified Assembly Language (Tiny) on Node.JS, originally made in 30 minutes because I was bored in US History.

4 registers (all 32 bits).

Naming convention is vX.

v3 is reserved for instruction pointer, and v2 is used as a comparison output.

4096 memory addresses each storing a 32 bit number.

Programs are read from ROM.

Every instruction is one byte, including arguments.

Instructions:

0: exit

Exit the program.

1: outp [v0-v3]

Output an ASCII value from any register (can overflow, values over 255 wrap around)

2: inpt [v0-v3]

Output an ASCII value to any register

3: swap [v0-v3] [v0-v3]

Swap two registers

4: swmm [v0-v3] [address in v0-v3]

Swap a register and the value of a memory address stored in a register

5: cnst [v0-v3] 

Set a register to the next 4 bytes’ constant value in little endian

6: iadd [v0-v3] [v0-v3]

(Integer) a+b into a

7: isub [v0-v3] [v0-v3]
(Integer) a-b into a

8: imul [v0-v3] [v0-v3]

(Integer) a*b into a

9: idvf [v0-v3] [v0-v3]

(Integer) floor(a/b) into a

a: idvc [v0-v3] [v0-v3]

(Integer) ceil(a/b) into a

b: imod [v0-v3] [v0-v3]

(Integer) a % b into a

c: grtr [v0-v3] [v0-v3] 

Sets v2 to 0 or 1 if argument a > argument b

d: less [v0-v3] [v0-v3] 

Sets v2 to 0 or 1 if argument a < argument b

e: eqls [v0-v3] [v0-v3] 

Sets v2 to 0 or 1 if argument a = argument b

f (arg 2 = 0): incr [v0-v3]

Increment v0-v3

f (arg 2 = 1): decr [v0-v3]

Decrement v0-v3
