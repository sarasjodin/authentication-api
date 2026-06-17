require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database(process.env.DATABASE_URL);
