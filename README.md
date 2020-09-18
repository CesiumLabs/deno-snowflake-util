# Snowflake Util
Snowflake Utility provider based on **[Discord.js](https://discord.js.org)** **[SnowflakeUtil](https://discord.js.org/#/docs/main/stable/class/SnowflakeUtil)**.

# Epoch
Default epoch is `1420070400000`.

# Example
## Generate random Snowflake

```js
import Snowflake from "https://raw.githubusercontent.com/Snowflake107/deno-snowflake-util/master/mod.ts";
const snowflake = new Snowflake();

console.log(snowflake.generate());
// 756403198394237027
```

## Deconstruct Snowflake

```js
import Snowflake from "https://raw.githubusercontent.com/Snowflake107/deno-snowflake-util/master/mod.ts";
const snowflake = new Snowflake();

console.log(snowflake.deconstruct("756403198394237027"));

/*
{
  epoch: 1420070400000,
  timestamp: 1600410975789,
  workerID: 1,
  processID: 0,
  increment: 99,
  binary: '0000101001111111010010001011001110001011010000100000000001100011',
  date: 2020-09-18T06:36:15.789Z,
  snowflake: '756403198394237027'
}
*/
```

# API
## Snowflake({ epoch, increment })
Instantiates `SnowflakeUtil`.

## generate(timestamp)
Generates a Snowflake.

## deconstruct(snowflake)
Deconstructs a Snowflake.

## toBase64(snowflake)
Converts a Snowflake into `base64` string.

## fromBase64(base64Snowflake)
Converts base64 encoded Snowflake into regular snowflake and returns deconstructed Snowflake.