<template>
  <div class="build-spec-sheet">
    <div class="spec-header">
      <h2>Build Specification Sheet</h2>
      <div class="header-actions">
        <button v-if="!isEditing" @click="startEditing" class="edit-btn">
          <Icon name="edit" />
        </button>
        <button v-if="isEditing" @click="saveSpecs" class="save-btn" :disabled="isSaving">
          <Icon name="document" />
          {{ isSaving ? 'Saving...' : 'Save' }}
        </button>
        <button v-if="isEditing" @click="cancelEditing" class="cancel-btn">
          Cancel
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p>Loading build specifications...</p>
    </div>

    <div v-else class="spec-content">
      <!-- Vehicle Information -->
      <div class="spec-section">
        <h3>Vehicle Information</h3>
        <div class="spec-grid">
          <div class="spec-field">
            <label>Vehicle Name</label>
            <input v-model="specs.vehicle_name" :disabled="!isEditing" type="text" placeholder="Enter vehicle name" />
          </div>
          <div class="spec-field">
            <label>Vehicle Type</label>
            <select v-model="specs.vehicle_type" :disabled="!isEditing">
              <option value="">Select type</option>
              <option value="Buggy">Buggy</option>
              <option value="Truggy">Truggy</option>
              <option value="Monster Truck">Monster Truck</option>
              <option value="Short Course">Short Course</option>
              <option value="Crawler">Crawler</option>
              <option value="Drift Car">Drift Car</option>
              <option value="On-Road">On-Road</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Scale</label>
            <select v-model="specs.scale" :disabled="!isEditing">
              <option value="">Select scale</option>
              <option value="1/8">1/8</option>
              <option value="1/10">1/10</option>
              <option value="1/12">1/12</option>
              <option value="1/14">1/14</option>
              <option value="1/16">1/16</option>
              <option value="1/18">1/18</option>
              <option value="1/24">1/24</option>
              <option value="1/28">1/28</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Brand</label>
            <input v-model="specs.brand" :disabled="!isEditing" type="text" placeholder="e.g., Traxxas, Arrma, Losi" />
          </div>
          <div class="spec-field">
            <label>Model</label>
            <input v-model="specs.model" :disabled="!isEditing" type="text" placeholder="e.g., Slash, Rustler, E-Revo" />
          </div>
          <div class="spec-field">
            <label>Year</label>
            <input v-model="specs.year" :disabled="!isEditing" type="text" placeholder="e.g., 2023" />
          </div>
        </div>
      </div>

      <!-- Motor/Engine -->
      <div class="spec-section">
        <h3>Motor/Engine</h3>
        <div class="spec-grid">
          <div class="spec-field">
            <label>Motor Type</label>
            <select v-model="specs.motor_type" :disabled="!isEditing">
              <option value="">Select type</option>
              <option value="Brushless">Brushless</option>
              <option value="Brushed">Brushed</option>
              <option value="Nitro">Nitro</option>
              <option value="Gas">Gas</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Motor Size</label>
            <input v-model="specs.motor_size" :disabled="!isEditing" type="text" placeholder="e.g., 3660, 540, 550" />
          </div>
          <div class="spec-field">
            <label>Motor KV</label>
            <input v-model="specs.motor_kv" :disabled="!isEditing" type="text" placeholder="e.g., 2200KV, 3500KV" />
          </div>
          <div class="spec-field">
            <label>ESC</label>
            <input v-model="specs.esc" :disabled="!isEditing" type="text" placeholder="e.g., VXL-3s, Mamba Monster" />
          </div>
          <div class="spec-field">
            <label>ESC Amp Rating</label>
            <input v-model="specs.esc_amp_rating" :disabled="!isEditing" type="text" placeholder="e.g., 100A, 150A" />
          </div>
          <div class="spec-field">
            <label>Battery Type</label>
            <select v-model="specs.battery_type" :disabled="!isEditing">
              <option value="">Select type</option>
              <option value="LiPo">LiPo</option>
              <option value="LiFe">LiFe</option>
              <option value="NiMH">NiMH</option>
              <option value="NiCad">NiCad</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Battery Capacity</label>
            <input v-model="specs.battery_capacity" :disabled="!isEditing" type="text" placeholder="e.g., 5000mAh, 8000mAh" />
          </div>
          <div class="spec-field">
            <label>Battery Voltage</label>
            <input v-model="specs.battery_voltage" :disabled="!isEditing" type="text" placeholder="e.g., 2S, 3S, 4S" />
          </div>
          <div class="spec-field">
            <label>Battery Connector</label>
            <input v-model="specs.battery_connector" :disabled="!isEditing" type="text" placeholder="e.g., Deans, XT60, EC5" />
          </div>
        </div>
      </div>

      <!-- Drivetrain -->
      <div class="spec-section">
        <h3>Drivetrain</h3>
        <div class="spec-grid">
          <div class="spec-field">
            <label>Transmission Type</label>
            <select v-model="specs.transmission_type" :disabled="!isEditing">
              <option value="">Select type</option>
              <option value="Single Speed">Single Speed</option>
              <option value="2-Speed">2-Speed</option>
              <option value="3-Speed">3-Speed</option>
              <option value="CVT">CVT</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Gear Ratio</label>
            <input v-model="specs.gear_ratio" :disabled="!isEditing" type="text" placeholder="e.g., 12.5:1, 15.2:1" />
          </div>
          <div class="spec-field">
            <label>Differential Type</label>
            <select v-model="specs.differential_type" :disabled="!isEditing">
              <option value="">Select type</option>
              <option value="Open">Open</option>
              <option value="Limited Slip">Limited Slip</option>
              <option value="Locked">Locked</option>
              <option value="Spool">Spool</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Drive Type</label>
            <select v-model="specs.drive_type" :disabled="!isEditing">
              <option value="">Select type</option>
              <option value="2WD">2WD</option>
              <option value="4WD">4WD</option>
              <option value="AWD">AWD</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Tire Size</label>
            <input v-model="specs.tire_size" :disabled="!isEditing" type="text" placeholder="e.g., 2.8 inches, 3.8 inches" />
          </div>
          <div class="spec-field">
            <label>Tire Type</label>
            <input v-model="specs.tire_type" :disabled="!isEditing" type="text" placeholder="e.g., All-Terrain, Mud, Street" />
          </div>
          <div class="spec-field">
            <label>Wheel Size</label>
            <input v-model="specs.wheel_size" :disabled="!isEditing" type="text" placeholder="e.g., 2.2 inches, 3.0 inches" />
          </div>
          <div class="spec-field">
            <label>Wheel Offset</label>
            <input v-model="specs.wheel_offset" :disabled="!isEditing" type="text" placeholder="e.g., 0mm, +5mm, -2mm" />
          </div>
        </div>
      </div>

      <!-- Suspension -->
      <div class="spec-section">
        <h3>Suspension</h3>
        <div class="spec-grid">
          <div class="spec-field">
            <label>Suspension Type</label>
            <select v-model="specs.suspension_type" :disabled="!isEditing">
              <option value="">Select type</option>
              <option value="Independent">Independent</option>
              <option value="Solid Axle">Solid Axle</option>
              <option value="Live Axle">Live Axle</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Shock Type</label>
            <input v-model="specs.shock_type" :disabled="!isEditing" type="text" placeholder="e.g., Oil Filled, Air, Coilover" />
          </div>
          <div class="spec-field">
            <label>Shock Length</label>
            <input v-model="specs.shock_length" :disabled="!isEditing" type="text" placeholder="e.g., 100mm, 120mm" />
          </div>
          <div class="spec-field">
            <label>Spring Rate</label>
            <input v-model="specs.spring_rate" :disabled="!isEditing" type="text" placeholder="e.g., Soft, Medium, Hard" />
          </div>
          <div class="spec-field">
            <label>Ride Height</label>
            <input v-model="specs.ride_height" :disabled="!isEditing" type="text" placeholder="e.g., 25mm, 30mm" />
          </div>
          <div class="spec-field">
            <label>Camber Angle</label>
            <input v-model="specs.camber_angle" :disabled="!isEditing" type="text" placeholder="e.g., -2 degrees, 0 degrees" />
          </div>
          <div class="spec-field">
            <label>Toe Angle</label>
            <input v-model="specs.toe_angle" :disabled="!isEditing" type="text" placeholder="e.g., 0 degrees, +2 degrees" />
          </div>
        </div>
      </div>

      <!-- Electronics -->
      <div class="spec-section">
        <h3>Electronics</h3>
        <div class="spec-grid">
          <div class="spec-field">
            <label>Receiver</label>
            <input v-model="specs.receiver" :disabled="!isEditing" type="text" placeholder="e.g., TQi, DX5C, Futaba" />
          </div>
          <div class="spec-field">
            <label>Servo Type</label>
            <input v-model="specs.servo_type" :disabled="!isEditing" type="text" placeholder="e.g., Digital, Analog, Brushless" />
          </div>
          <div class="spec-field">
            <label>Servo Torque</label>
            <input v-model="specs.servo_torque" :disabled="!isEditing" type="text" placeholder="e.g., 200oz-in, 300oz-in" />
          </div>
          <div class="spec-field">
            <label>Servo Speed</label>
            <input v-model="specs.servo_speed" :disabled="!isEditing" type="text" placeholder="e.g., 0.15s/60deg, 0.12s/60deg" />
          </div>
          <div class="spec-field">
            <label>Gyro</label>
            <input v-model="specs.gyro" :disabled="!isEditing" type="text" placeholder="e.g., AVC, TSM, None" />
          </div>
          <div class="spec-field">
            <label>Lights</label>
            <input v-model="specs.lights" :disabled="!isEditing" type="text" placeholder="e.g., LED Kit, Light Bar, None" />
          </div>
          <div class="spec-field">
            <label>Sound System</label>
            <input v-model="specs.sound_system" :disabled="!isEditing" type="text" placeholder="e.g., ESS Dual, None" />
          </div>
        </div>
      </div>

      <!-- Body/Chassis -->
      <div class="spec-section">
        <h3>Body/Chassis</h3>
        <div class="spec-grid">
          <div class="spec-field">
            <label>Body Material</label>
            <select v-model="specs.body_material" :disabled="!isEditing">
              <option value="">Select material</option>
              <option value="Polycarbonate">Polycarbonate</option>
              <option value="ABS">ABS</option>
              <option value="Fiberglass">Fiberglass</option>
              <option value="Carbon Fiber">Carbon Fiber</option>
              <option value="Aluminum">Aluminum</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Chassis Material</label>
            <select v-model="specs.chassis_material" :disabled="!isEditing">
              <option value="">Select material</option>
              <option value="Plastic">Plastic</option>
              <option value="Aluminum">Aluminum</option>
              <option value="Carbon Fiber">Carbon Fiber</option>
              <option value="Steel">Steel</option>
            </select>
          </div>
          <div class="spec-field">
            <label>Wheelbase</label>
            <input v-model="specs.wheelbase" :disabled="!isEditing" type="text" placeholder="e.g., 325mm, 12.8 inches" />
          </div>
          <div class="spec-field">
            <label>Track Width</label>
            <input v-model="specs.track_width" :disabled="!isEditing" type="text" placeholder="e.g., 280mm, 11.0 inches" />
          </div>
          <div class="spec-field">
            <label>Ground Clearance</label>
            <input v-model="specs.ground_clearance" :disabled="!isEditing" type="text" placeholder="e.g., 35mm, 1.4 inches" />
          </div>
          <div class="spec-field">
            <label>Weight</label>
            <input v-model="specs.weight" :disabled="!isEditing" type="text" placeholder="e.g., 3.2kg, 7.0lbs" />
          </div>
        </div>
      </div>

      <!-- Performance -->
      <div class="spec-section">
        <h3>Performance</h3>
        <div class="spec-grid">
          <div class="spec-field">
            <label>Top Speed</label>
            <input v-model="specs.top_speed" :disabled="!isEditing" type="text" placeholder="e.g., 60mph, 97km/h" />
          </div>
          <div class="spec-field">
            <label>Acceleration</label>
            <input v-model="specs.acceleration" :disabled="!isEditing" type="text" placeholder="e.g., 0-60 in 3.2s" />
          </div>
          <div class="spec-field">
            <label>Runtime</label>
            <input v-model="specs.runtime" :disabled="!isEditing" type="text" placeholder="e.g., 20 minutes, 45 minutes" />
          </div>
          <div class="spec-field">
            <label>Range</label>
            <input v-model="specs.range" :disabled="!isEditing" type="text" placeholder="e.g., 2 miles, 3.2km" />
          </div>
        </div>
      </div>

      <!-- Custom Modifications -->
      <div class="spec-section">
        <h3>Custom Modifications</h3>
        <div class="spec-grid">
          <div class="spec-field full-width">
            <label>Custom Modifications</label>
            <textarea v-model="specs.custom_mods" :disabled="!isEditing" rows="3" placeholder="List any custom modifications made to the vehicle..."></textarea>
          </div>
          <div class="spec-field full-width">
            <label>Aftermarket Parts</label>
            <textarea v-model="specs.aftermarket_parts" :disabled="!isEditing" rows="3" placeholder="List any aftermarket parts installed..."></textarea>
          </div>
          <div class="spec-field full-width">
            <label>Notes</label>
            <textarea v-model="specs.notes" :disabled="!isEditing" rows="4" placeholder="Additional notes, setup tips, or observations..."></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../lib/supabase'
import Icon from './Icon.vue'

const props = defineProps({
  projectId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['saved'])

const specs = ref({
  vehicle_name: '',
  vehicle_type: '',
  scale: '',
  brand: '',
  model: '',
  year: '',
  motor_type: '',
  motor_size: '',
  motor_kv: '',
  esc: '',
  esc_amp_rating: '',
  battery_type: '',
  battery_capacity: '',
  battery_voltage: '',
  battery_connector: '',
  transmission_type: '',
  gear_ratio: '',
  differential_type: '',
  drive_type: '',
  tire_size: '',
  tire_type: '',
  wheel_size: '',
  wheel_offset: '',
  suspension_type: '',
  shock_type: '',
  shock_length: '',
  spring_rate: '',
  ride_height: '',
  camber_angle: '',
  toe_angle: '',
  receiver: '',
  servo_type: '',
  servo_torque: '',
  servo_speed: '',
  gyro: '',
  lights: '',
  sound_system: '',
  body_material: '',
  chassis_material: '',
  wheelbase: '',
  track_width: '',
  ground_clearance: '',
  weight: '',
  top_speed: '',
  acceleration: '',
  runtime: '',
  range: '',
  custom_mods: '',
  aftermarket_parts: '',
  notes: ''
})

const isEditing = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const originalSpecs = ref(null)

const loadSpecs = async () => {
  if (!props.projectId) {
    console.warn('No projectId provided to BuildSpecSheet')
    return
  }
  
  console.log('Loading build specs for project:', props.projectId)
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('build_spec_sheets')
      .select('*')
      .eq('project_id', props.projectId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // PGRST116 is "not found"
        console.log('No existing build spec sheet found for project:', props.projectId)
      } else {
        console.error('Error loading build specs:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
      }
      return
    }

    if (data) {
      console.log('Loaded build specs:', data)
      specs.value = { ...specs.value, ...data }
    }
    
    // Store original values for cancel functionality
    originalSpecs.value = JSON.parse(JSON.stringify(specs.value))
  } catch (error) {
    console.error('Error loading build specs:', error)
  } finally {
    isLoading.value = false
  }
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  specs.value = JSON.parse(JSON.stringify(originalSpecs.value))
  isEditing.value = false
}

const saveSpecs = async () => {
  if (!props.projectId) {
    console.error('No projectId provided to BuildSpecSheet')
    return
  }
  
  isSaving.value = true
  try {
    const { data, error } = await supabase
      .from('build_spec_sheets')
      .upsert({
        project_id: props.projectId,
        ...specs.value
      })

    if (error) {
      console.error('Error saving build specs:', error)
      return
    }

    isEditing.value = false
    originalSpecs.value = JSON.parse(JSON.stringify(specs.value))
    emit('saved')
  } catch (error) {
    console.error('Error saving build specs:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadSpecs()
})

watch(() => props.projectId, () => {
  if (props.projectId) {
    loadSpecs()
  }
})
</script>

<style scoped>
.build-spec-sheet {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.spec-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.edit-btn, .save-btn, .cancel-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background: none;
  color: #3b82f6;
}

.edit-btn:hover {
  background: #eff6ff;
}

.save-btn {
  background: #10b981;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #059669;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6b7280;
  color: white;
}

.cancel-btn:hover {
  background: #4b5563;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.spec-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.spec-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spec-section h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.spec-field {
  display: flex;
  flex-direction: column;
}

.spec-field.full-width {
  grid-column: 1 / -1;
}

.spec-field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.spec-field input,
.spec-field select,
.spec-field textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s;
}

.spec-field input:focus,
.spec-field select:focus,
.spec-field textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.spec-field input:disabled,
.spec-field select:disabled,
.spec-field textarea:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.spec-field textarea {
  resize: vertical;
  min-height: 80px;
}

@media (max-width: 768px) {
  .build-spec-sheet {
    padding: 15px;
  }
  
  .spec-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .spec-grid {
    grid-template-columns: 1fr;
  }
  
  .spec-section {
    padding: 20px;
  }
}
</style> 