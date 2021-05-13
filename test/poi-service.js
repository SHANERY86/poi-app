"use strict";

const axios = require("axios");

class POIService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getUsers() {
        const response = await axios.get(this.baseUrl + "/api/users");
        return response.data;
    }

    async getUser(id) {
    try {
        const response = await axios.get(this.baseUrl + "/api/users/" + id);
        return response.data;
    } catch (e) {
        return null;
    }
    }

    async createUser(newUser) {
        const response = await axios.post(this.baseUrl + "/api/users", newUser);
        return response.data;
    }

    async deleteAllUsers() {
        const response = await axios.delete(this.baseUrl + "/api/users");
        return response.data;
    }

    async deleteOneUser(id) {
        const response = await axios.delete(this.baseUrl + "/api/users" + id);
        return response.data;
    }

    async getPlaces() {
        const response = await axios.get(this.baseUrl + "/api/places");
        return response.data;
    }

    async getPlace(id) {
        const response = await axios.get(this.baseUrl + "/api/places");
        return response.data;
    }

    async createPlace(newPlace) {
        const response = await axios.post(this.baseUrl + "/api/places", newPlace);
        return response.data;
    }

    async deletePlace(id) {
        const response = await axios.delete(this.baseUrl + "/api/places" + id);
        return response.data;
    }

    async deleteAllPlaces() {
        const response = await axios.delete(this.baseUrl + "api/places");
        return response.data;
    }
}