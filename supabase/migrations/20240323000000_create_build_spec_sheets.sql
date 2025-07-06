-- Create build_spec_sheets table
create table if not exists public.build_spec_sheets (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    
    -- Vehicle Information
    vehicle_name text,
    vehicle_type text,
    scale text,
    brand text,
    model text,
    year text,
    
    -- Motor/Engine
    motor_type text,
    motor_size text,
    motor_kv text,
    esc text,
    esc_amp_rating text,
    battery_type text,
    battery_capacity text,
    battery_voltage text,
    battery_connector text,
    
    -- Drivetrain
    transmission_type text,
    gear_ratio text,
    differential_type text,
    drive_type text,
    tire_size text,
    tire_type text,
    wheel_size text,
    wheel_offset text,
    
    -- Suspension
    suspension_type text,
    shock_type text,
    shock_length text,
    spring_rate text,
    ride_height text,
    camber_angle text,
    toe_angle text,
    
    -- Electronics
    receiver text,
    servo_type text,
    servo_torque text,
    servo_speed text,
    gyro text,
    lights text,
    sound_system text,
    
    -- Body/Chassis
    body_material text,
    chassis_material text,
    wheelbase text,
    track_width text,
    ground_clearance text,
    weight text,
    
    -- Performance
    top_speed text,
    acceleration text,
    runtime text,
    range text,
    
    -- Custom Modifications
    custom_mods text,
    aftermarket_parts text,
    notes text,
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Ensure one build spec sheet per project
    unique(project_id)
);

-- Enable Row Level Security (RLS)
alter table public.build_spec_sheets enable row level security;

-- Create policies
create policy "Users can view build spec sheets for their own projects"
    on public.build_spec_sheets for select
    using (
        exists (
            select 1 from public.projects 
            where projects.id = build_spec_sheets.project_id 
            and projects.user_id = auth.uid()
        )
    );

create policy "Users can insert build spec sheets for their own projects"
    on public.build_spec_sheets for insert
    with check (
        exists (
            select 1 from public.projects 
            where projects.id = build_spec_sheets.project_id 
            and projects.user_id = auth.uid()
        )
    );

create policy "Users can update build spec sheets for their own projects"
    on public.build_spec_sheets for update
    using (
        exists (
            select 1 from public.projects 
            where projects.id = build_spec_sheets.project_id 
            and projects.user_id = auth.uid()
        )
    );

create policy "Users can delete build spec sheets for their own projects"
    on public.build_spec_sheets for delete
    using (
        exists (
            select 1 from public.projects 
            where projects.id = build_spec_sheets.project_id 
            and projects.user_id = auth.uid()
        )
    );

-- Create trigger for updated_at
create trigger handle_build_spec_sheets_updated_at
    before update on public.build_spec_sheets
    for each row
    execute function public.handle_updated_at(); 