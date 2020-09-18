// @ts-ignore
import Snowflake from "../mod.ts";

const snowflake = new Snowflake();

const data = snowflake.deconstruct("756427443396542464");
console.log(data);