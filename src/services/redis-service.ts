import Redis from 'ioredis'
import { REDIS_EXPIRY_TIME } from '../constants'

export const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    port: parseInt(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD,
})

export const getValueFromRedis = async (key: string) => {
    try {
        const value = await redisClient.get(key)
        if(!value) {
            return null
        }
        return JSON.parse(value!)
    } catch (error) {
        console.log("GET_VALUE_FROM_REDIS_ERROR", error)
        return null
    }
}

export const setValueInRedis = async (key: string, value: any) => {
    try {
        await redisClient.set
        (key, JSON.stringify(value))
        await redisClient.expire(key, REDIS_EXPIRY_TIME)
    } catch (error) {
        console.log("SET_VALUE_IN_REDIS_ERROR", error)
    }
}