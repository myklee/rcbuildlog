// Fallback Parser for RC Build Log
// Extracts specifications using keyword matching and regex patterns
// Works without any LLM API - completely free and offline

class FallbackParser {
  constructor() {
    this.patterns = {
      // Motor patterns
      motor: {
        brushless: /(?:brushless|BLDC|BL)\s*(?:motor)?/i,
        brushed: /(?:brushed|DC)\s*(?:motor)?/i,
        size: /(\d{4})\s*(?:motor|size)/i, // 3650, 540, etc.
        kv: /(\d+(?:\.\d+)?)\s*(?:KV|kv|rpm\/v)/i,
        esc: /(?:ESC|esc|electronic\s*speed\s*controller)\s*(?:(\d+)\s*A)?/i,
        esc_amp: /(\d+)\s*A\s*(?:ESC|esc)/i
      },
      
      // Battery patterns
      battery: {
        lipo: /(?:LiPo|Li-Ion|lithium\s*polymer)\s*(?:battery)?/i,
        nimh: /(?:NiMH|nickel\s*metal\s*hydride)\s*(?:battery)?/i,
        capacity: /(\d+(?:\.\d+)?)\s*(?:mAh|mah|milliamp)/i,
        voltage: /(\d+)\s*S\s*(?:LiPo|battery)/i,
        connector: /(?:XT\d+|Deans|Tamiya|EC\d+)\s*(?:connector)?/i
      },
      
      // Vehicle patterns
      vehicle: {
        scale: /1\/(\d+)\s*(?:scale|th)/i,
        brand: /(?:Traxxas|Arrma|HPI|Tamiya|Kyosho|Team\s*Associated|Losi|Redcat|ECX|Axial)/i,
        model: /(?:Slash|Rustler|Stampede|Bandit|E-Revo|Maxx|X-Maxx|Kraton|Outcast|Typhon|Senton|Granite|Big\s*Rock|Vorteks|Notorious|Fireteam|Mojave|Infraction|Felony|Limitless|DBXL|Baja|Rampage|Trophy|Truggy|Buggy|Crawler|Monster\s*Truck|Short\s*Course|Stadium\s*Truck|Drift|Rally|Touring|On-Road|Off-Road)/i,
        type: /(?:4x4|4WD|2WD|AWD|RWD|4WD|2x4|4x2)/i
      },
      
      // Drivetrain patterns
      drivetrain: {
        tire: /(?:Pro-Line|Duratrax|JConcepts|Aka|Sweep|Louise|GRP|Hpi|Traxxas)\s+([A-Za-z\s]+?)(?:\s+tire|\s+wheel|\s+tyre)/i,
        gearing: /(\d+)\s*T\s*(?:pinion|spur|gear)/i,
        differential: /(?:differential|diff)\s*(?:gear|ratio)?/i
      },
      
      // Electronics patterns
      electronics: {
        receiver: /(?:receiver|RX|rx)\s*(?:(\w+))?/i,
        transmitter: /(?:transmitter|TX|tx|radio)\s*(?:(\w+))?/i,
        servo: /(?:servo|steering\s*servo)\s*(?:(\w+))?/i,
        gyro: /(?:gyro|gyroscope|stabilizer)/i
      },
      
      // Performance patterns
      performance: {
        speed: /(\d+(?:\.\d+)?)\s*(?:mph|kmh|km\/h|miles\s*per\s*hour)/i,
        acceleration: /(?:acceleration|0-60|zero\s*to\s*sixty)/i,
        runtime: /(\d+(?:\.\d+)?)\s*(?:min|minutes|hours?)/i
      }
    }
  }

  extractSpecsFromText(text) {
    if (!text || typeof text !== 'string') {
      return null
    }

    const specs = {
      motor_engine: {},
      battery_power: {},
      vehicle_info: {},
      drivetrain: {},
      electronics: {},
      performance: {},
      custom_modifications: []
    }

    // Extract motor specs
    if (this.patterns.motor.brushless.test(text)) {
      specs.motor_engine.motor_type = 'brushless'
    } else if (this.patterns.motor.brushed.test(text)) {
      specs.motor_engine.motor_type = 'brushed'
    }

    const motorSizeMatch = text.match(this.patterns.motor.size)
    if (motorSizeMatch) {
      specs.motor_engine.motor_size = motorSizeMatch[1]
    }

    const kvMatch = text.match(this.patterns.motor.kv)
    if (kvMatch) {
      specs.motor_engine.motor_kv = kvMatch[1] + 'KV'
    }

    const escMatch = text.match(this.patterns.motor.esc)
    if (escMatch) {
      specs.motor_engine.esc = escMatch[0]
      if (escMatch[1]) {
        specs.motor_engine.esc_amp_rating = escMatch[1] + 'A'
      }
    }

    // Extract battery specs
    if (this.patterns.battery.lipo.test(text)) {
      specs.battery_power.battery_type = 'LiPo'
    } else if (this.patterns.battery.nimh.test(text)) {
      specs.battery_power.battery_type = 'NiMH'
    }

    const capacityMatch = text.match(this.patterns.battery.capacity)
    if (capacityMatch) {
      specs.battery_power.battery_capacity = capacityMatch[1] + 'mAh'
    }

    const voltageMatch = text.match(this.patterns.battery.voltage)
    if (voltageMatch) {
      specs.battery_power.battery_voltage = voltageMatch[1] + 'S'
    }

    const connectorMatch = text.match(this.patterns.battery.connector)
    if (connectorMatch) {
      specs.battery_power.battery_connector = connectorMatch[0]
    }

    // Extract vehicle specs
    const scaleMatch = text.match(this.patterns.vehicle.scale)
    if (scaleMatch) {
      specs.vehicle_info.scale = '1/' + scaleMatch[1]
    }

    const brandMatch = text.match(this.patterns.vehicle.brand)
    if (brandMatch) {
      specs.vehicle_info.brand = brandMatch[0]
    }

    const modelMatch = text.match(this.patterns.vehicle.model)
    if (modelMatch) {
      specs.vehicle_info.model = modelMatch[0]
    }

    const typeMatch = text.match(this.patterns.vehicle.type)
    if (typeMatch) {
      specs.vehicle_info.vehicle_type = typeMatch[0]
    }

    // Extract drivetrain specs
    const tireMatch = text.match(this.patterns.drivetrain.tire)
    if (tireMatch) {
      specs.drivetrain.tire_type = tireMatch[0]
    }

    const gearingMatch = text.match(this.patterns.drivetrain.gearing)
    if (gearingMatch) {
      specs.drivetrain.pinion_gear = gearingMatch[1] + 'T'
    }

    // Extract electronics specs
    const receiverMatch = text.match(this.patterns.electronics.receiver)
    if (receiverMatch) {
      specs.electronics.receiver = receiverMatch[0]
    }

    const transmitterMatch = text.match(this.patterns.electronics.transmitter)
    if (transmitterMatch) {
      specs.electronics.transmitter = transmitterMatch[0]
    }

    const servoMatch = text.match(this.patterns.electronics.servo)
    if (servoMatch) {
      specs.electronics.servo = servoMatch[0]
    }

    if (this.patterns.electronics.gyro.test(text)) {
      specs.electronics.gyro = 'Yes'
    }

    // Extract performance specs
    const speedMatch = text.match(this.patterns.performance.speed)
    if (speedMatch) {
      specs.performance.top_speed = speedMatch[1] + ' mph'
    }

    if (this.patterns.performance.acceleration.test(text)) {
      specs.performance.acceleration = 'Noted'
    }

    const runtimeMatch = text.match(this.patterns.performance.runtime)
    if (runtimeMatch) {
      specs.performance.runtime = runtimeMatch[1] + ' minutes'
    }

    // Look for custom modifications
    const modKeywords = [
      'upgrade', 'modified', 'custom', 'aftermarket', 'installed', 'added',
      'replaced', 'changed', 'improved', 'enhanced', 'tuned', 'adjusted'
    ]

    const sentences = text.split(/[.!?]+/).filter(s => s.trim())
    sentences.forEach(sentence => {
      const hasModKeyword = modKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
      if (hasModKeyword) {
        specs.custom_modifications.push(sentence.trim())
      }
    })

    // Clean up empty objects
    Object.keys(specs).forEach(key => {
      if (specs[key] && typeof specs[key] === 'object' && Object.keys(specs[key]).length === 0) {
        delete specs[key]
      }
    })

    return Object.keys(specs).length > 0 ? specs : null
  }

  async parseLogEntry(logEntry) {
    return this.extractSpecsFromText(logEntry.content)
  }

  async parseImageDescription(imageDescription) {
    return this.extractSpecsFromText(imageDescription)
  }

  async parseProjectLogs(projectId) {
    // This would need to be implemented with Supabase integration
    // For now, return empty array
    return []
  }

  // Test the parser with sample data
  testParser() {
    const testText = "Just installed the new Hobbywing 3650 3200KV brushless motor with a 60A ESC. Running on 3S 5000mAh LiPo battery with XT60 connectors. The car is a 1/10 scale Traxxas Slash 4x4 with Pro-Line Badlands tires."
    
    const result = this.extractSpecsFromText(testText)
    console.log('Fallback parser test result:', result)
    return result
  }
}

export const fallbackParser = new FallbackParser() 