const express = require('express')
const app = express()
const axios = require('axios')
const https = require('https')

const { Module } = require('../db/models')

const token = process.env.PROXY_TOKEN
const baseUrlKori = process.env.SIS_API_URL + '/kori/api'

const api = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false })
})

async function akualCreditResolver(rule, n) {
  const data = await akualResolver(rule.rule,  n+1)
  return {
    credits: rule.credits,
    data: data
  }
}

const newest = (data) => {
  const max_rev = Math.max(...data.map(d => d.metadata.revision) )
  return data.find(d => d.metadata.revision === max_rev) 
}

async function akualGropingModuleResolver(mostResent, n) {
  const result = []
  if ( mostResent.rule.rules ) {
    for ( let i = 0; i<mostResent.rule.rules.length; i++ ) {
      const aRule = mostResent.rule.rules[i]
      const restul = await akualResolver(aRule,  n+1)
      result.push(restul)
    }
  } else {
    result.push(await akualResolver(mostResent.rule,  n+1))
  }

  return result
}

async function akualStudyModuleResolver(mostResent, n) {
  const result = []  
  if ( mostResent.rule.rules) {   
    for ( i = 0; i<mostResent.rule.rules.length; i++ ) {
      const aRule = mostResent.rule.rules[i]
      result.push(await akualResolver(aRule, n+1))
    }
  } else {
    result.push(await akualResolver(mostResent.rule,  n+1))
  }
  return result
}

async function akualModuleResolver(rule, n) {
  const id = rule.moduleGroupId

  const url = `${baseUrlKori}/modules/?token=${token}&groupId=${id}`
  const { data } = await api.get(url) 

  const mostResent = newest(data)

  if (mostResent.type == 'StudyModule') {
    const result = await akualStudyModuleResolver(mostResent, n)
    return {
      name: mostResent.name.fi,
      studyLevel: mostResent.studyLevel,
      targetCredits: mostResent.targetCredits,
      code: mostResent.code,
      type: mostResent.type,
      result,
    }
  }  
  
  if (mostResent.type == 'GroupingModule') {
    const result = await akualGropingModuleResolver(mostResent, n)
    return {
      name: mostResent.name.fi,
      type: mostResent.type,
      result,
      allMandatory:  mostResent.type.allMandatory
    }  
  }

  return {
    name: mostResent.name.fi,
    type: mostResent.type,
    result: "prblmmmmmmmmmmm "+ mostResent.type
  }
}

async function akualCompositeResolver(rule, n) {
  const result = []

  for ( let i=0; i<rule.rules.length; i++) {
    const aRule = rule.rules[i]
    result.push(await akualResolver(aRule, n+1))
  }

  if (includeRules) {
    return {
      data:result, rule
    }
  }

  return result
}


async function akualCourseResolver(rule, n) {
  const id = rule.courseUnitGroupId
  const url = `${baseUrlKori}/course-units?groupId=${id}&token=${token}` 

  const { data }  = await api.get(url)
  const mostResent = newest(data)
  return  {
    name: mostResent.name ? mostResent.name.fi : 'noname!????!',
    credits: mostResent.credits.min,
    code: mostResent.code
  }
}


let seen = null 
const includeRules = false

async function akualResolver(rule, n) {
  const lid = rule.localId


  if (seen.includes(lid) ) {
    console.log('WOOOOOT!')
    return {
      type: rule.type,
      lid,
      groupId: rule.moduleGroupId,
      message: '===================rekursio===================='
    }
  }

  seen.push(lid)

  if (n > 12) {
    return 'no_moar'
  } else if (!n) {
    return '***'
  }

  //console.log('===>', n, rule.type, rule.localId)
  if ( rule.type == 'CreditsRule'){
    const data = await akualCreditResolver(rule, n)
    return {
      type: rule.type,
      data,
      rule: includeRules ? rule :null
      //lid
    }
  } 
  if ( rule.type == 'CompositeRule'){
    const data = await akualCompositeResolver(rule, n)
    return {
      type: rule.type,
      data,
      rule: includeRules ? rule :null
      //lid
    }
  }
  if ( rule.type == 'ModuleRule'){
    const data = await akualModuleResolver(rule, n)

    return {
      type: rule.type,
      data,

      //lid
    }
  }
  if ( rule.type == 'CourseUnitRule'){
    const data = await akualCourseResolver(rule, n)
    return {
      type: rule.type,
      data,
      //rule: includeRules ? rule :null
      //lid
    }
  }

  return {
    type: rule.type,
    fact: 'unhandled...'
  }
}


app.get('/structure/:code', async (req, res) => {
  // http://localhost:3002/resolve2/KH50_005

  seen = []

  const result = await Module.findOne({ 
    where: {
      code: req.params.code
    }
  })

  const id = result.groupId
  const type = result.type 
  const name = result.name.fi

  const data = await akualResolver(result.rule, 1)

  res.json({
    id, type, name, data
  })
})

const PORT = 3002

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})