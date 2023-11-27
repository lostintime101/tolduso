"use client"
import PredictionWrapper from './predictionWrapper'
import Checker from './checker'
import SharePoster from './generateJpeg'
import React, { useState, useEffect } from 'react'

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config({ path: '../../../.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const userUUID = 'c8b2919b-80c7-45b0-aef0-29f7ca99097e'
// const userUUID = 'c8b2919b-80c7-45b0-aef0-29f7ca99097f'

export default function Content() {

  const [thisPrediction, setThisPrediction] = useState()
  const [rawPredictionFullText, setRawPredictionFullText] = useState()
  const [rawPrediction, setRawPrediction] = useState()
  const [rawSalt, setRawSalt] = useState()
  const [rawUser, setRawUser] = useState()
  const [rawDate, setRawDate] = useState()
  const [rawTxsHash, setRawTxsHash] = useState()
  const [rawPredictionHash, setRawPredictionHash] = useState()

  useEffect(() => {
    fetchPredicton()
}, []);

useEffect(() => {

  if(thisPrediction && thisPrediction[0] && thisPrediction[0].prediction_txt){

    const regex = /Prediction: (.*?)\s+Twitter ID: (.*?)\s+Salt: (.*)/;
    const match = thisPrediction[0].prediction_txt.match(regex);
    setRawPrediction(match[1])
    setRawUser(match[2])
    setRawSalt(match[3])
    setRawDate(formatDate(thisPrediction[0].created_at))
    setRawTxsHash(thisPrediction[0].txs_hash)
    setRawPredictionHash(thisPrediction[0].prediction_hash)
    setRawPredictionFullText(thisPrediction[0].prediction_txt)

    console.log("henlo", rawPrediction, rawUser, rawSalt, rawDate, rawTxsHash, rawPredictionHash)

  }

  function formatDate(inputDate) {
    const dateParts = inputDate.split(/[- :]/);
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    const hour = parseInt(dateParts[3]);
    const minute = parseInt(dateParts[4]);

    const inputDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute));
  
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC"
    };
  
    const formattedDate = inputDateTime.toLocaleString("en-US", options);
    return formattedDate;
  }

}, [thisPrediction]);

const fetchPredicton = async () => {
    const currentUrl = window.location.href;
    const currentSuffix = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    if(currentSuffix.length != 12) return console.error("error, incorrect suffix length");

    console.log("i'm fetchiiiinnnnggg")
    try {
    let { data, error } = await supabase
        .from('predictions')
        .select("*")
        .eq('sender', userUUID)
        .ilike('prediction_hash', `${currentSuffix}%`)
  
      setThisPrediction(data)
  
      if (error) {
        console.error('Error:', error.message);
      } else {
        console.log('Dataaaaaaaa:', data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  return (
      <main>
        <div id="section1" className="h-screen flex flex-col items-center justify-center">
          <PredictionWrapper rawDate={rawDate} rawTxsHash={rawTxsHash} rawPrediction={rawPrediction} rawUser={rawUser}/>
        </div>
        <div id="section2" className="h-screen flex flex-col items-center justify-center">
          <Checker rawPredictionFullText={rawPredictionFullText}/>
        </div>
        <div id="section3" className="h-screen flex flex-col items-center justify-center">
          <SharePoster/>
        </div>
      </main>
    )
}