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
        const response = await axios.delete(this.baseUrl + "/api/users/" + id);
        return response.data;
    }

    async getPlaces() {
        const response = await axios.get(this.baseUrl + "/api/places");
        return response.data;
    }

    async getPlace(id) {
        const response = await axios.get(this.baseUrl + "/api/places/" + id);
        return response.data;
    }

    async getPlacesByUser(id) {
        const response = await axios.get(this.baseUrl + "/api/" + id + "/places");
        return response.data;
    }

    async createPlace(id, newPlace) {
        const response = await axios.post(this.baseUrl + "/api/" + id + "/places", newPlace);
        return response.data;
    }

    async deletePlace(id) {
        const response = await axios.delete(this.baseUrl + "/api/places" + id);
        return response.data;
    }

    async deleteAllPlaces() {
        const response = await axios.delete(this.baseUrl + "/api/places");
        return response.data;
    }

    async deletePlacesByUser(id) {
        const response = await axios.delete(this.baseUrl + "/api/" + id + "/places");
        return response.data;
    }

    async setRating(id, rating){
        const response = await axios.post(this.baseUrl + "/api/ratings/"+ id, rating);
        return response.data;
    }

    async getRatings() {
        const response = await axios.get(this.baseUrl + "/api/ratings");
        return response.data;
    }

    async deleteAllRatings() {
        const response = await axios.delete(this.baseUrl + "/api/ratings");
        return response.data;
    }

    async makeReview(review) {
        const response = await axios.post(this.baseUrl + "/api/review",review);
        return response.data;
    }

    async editReview(id,reviewEdit) {
        const response = await axios.post(this.baseUrl + "/api/review/" + id,reviewEdit);
        return response.data;
    }

    async deleteReview(id) {
        const response = await axios.delete(this.baseUrl + "/api/review/" + id);
        return response.data;
    }

    async deleteAllReviews() {
        const response = await axios.delete(this.baseUrl + "/api/review");
        return response.data;
    }

    async getReviews() {
        const response = await axios.get(this.baseUrl + "/api/review");
        return response.data;
    }

    async getReview(id) {
        const response = await axios.get(this.baseUrl + "/api/review/" + id);
        return response.data;
    }

    async getAllComments() {
        const response = await axios.get(this.baseUrl + "/api/comments");
        return response.data;
    }

    async getComment(id){
        const response = await axios.get(this.baseUrl + "/api/comments/" + id);
        return response.data;
    }

    async deleteComment(id) {
        const response = await axios.delete(this.baseUrl + "/api/comments/" + id);
        return response.data;
    }

    async deleteAllComments() {
        const response = await axios.delete(this.baseUrl + "/api/comments");
        return response.data;
    }

    async makeComment(comment) {
        const response = await axios.post(this.baseUrl + "/api/comments",comment);
        return response.data;
    }

    async editComment(id,edit) {
        const response = await axios.post(this.baseUrl + "/api/comments/" + id,edit);
        return response.data;
    }

    async makeReply(id, reply){
        const response = await axios.post(this.baseUrl + "/api/commentreply/" + id ,reply)
        return response.data;
    }

    async editReply(id,edit){
        const response = await axios.post(this.baseUrl + "/api/commentreplyedit/" + id,edit);
        return response.data;
    }

    async deleteReply(id){
        const response = await axios.delete(this.baseUrl + "/api/commentreplydelete/" + id);
        return response.data;
    }

    async authenticate(user) {
        try {
          const response = await axios.post(this.baseUrl + "/api/users/authenticate", user);
          axios.defaults.headers.common["Authorization"] = "Bearer " + response.data.token;
          return response.data;
        } catch (e) {
          return null;
        }
      }
    
      async clearAuth(user) {
        axios.defaults.headers.common["Authorization"] = "";
      }

}

module.exports = POIService;