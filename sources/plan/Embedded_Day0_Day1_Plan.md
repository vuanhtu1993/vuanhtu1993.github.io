* [ ] 

# Embedded System Bootcamp: Kế hoạch Day 0 và Day 1

> **Mục tiêu chung:** Xây nền tảng chắc chắn trước khi học các peripheral (GPIO, Interrupt, UART...).
> **Nguyên tắc:** Concept → Mental Model → Example → Code → Practice
> **Môi trường:** Chưa cần phần cứng thật. Dùng PC + GCC (hoặc online compiler). Day 1 có thể dùng thêm trình mô phỏng online (ví dụ Wokwi) nếu muốn.

---

## Tổng quan 2 ngày

|                       | Day 0: C/C++ cho Embedded                            | Day 1: Mental model Embedded System                                       |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------- |
| **Mục tiêu**  | Viết C thành thạo ở mức memory, pointer, bit    | Hiểu MCU chạy firmware và điều khiển hardware như thế nào        |
| **Trọng tâm** | Pointer, Memory, Bitwise, Struct, volatile           | MCU architecture, Memory map, Register, Firmware flow                     |
| **Project**     | Embedded Device Simulator (C thuần)                 | Virtual MCU: điều khiển LED qua register mô phỏng                    |
| **Đầu ra**    | Project nhiều module`.c/.h`, build bằng Makefile | Firmware chạy trên "MCU ảo", hiểu chuỗi Code → Register → Hardware |

---

# DAY 0: C/C++ Foundation for Embedded

## Lịch học

| Thời gian   | Block                 | Nội dung                                                    |
| ------------ | --------------------- | ------------------------------------------------------------ |
| 08:00–09:30 | Lý thuyết 1         | Data types,`stdint.h`, operators, control flow, function   |
| 09:30–10:30 | Lab 1                 | Fixed-width types + function                                 |
| 10:30–12:00 | Lý thuyết 2 + Lab 2 | **Pointer**, pointer + array, pass by pointer          |
| 13:30–14:30 | Lý thuyết 3 + Lab 3 | **Bitwise**: set/clear/toggle/check bit, mask          |
| 14:30–15:30 | Lý thuyết 4 + Lab 4 | **Struct**, typedef, enum, pointer to struct (`->`)  |
| 15:30–16:30 | Lý thuyết 5 + Lab 5 | **Memory layout**, `static`, `const`, `volatile` |
| 16:30–17:00 | Lý thuyết 6         | Module`.c/.h`, header guard; C++ class (chỉ concept)      |
| 19:00–21:30 | Project               | Embedded Device Simulator                                    |
| 21:30–22:00 | Review                | Self-check quiz + ghi lại điểm yếu                       |

## 1. Lý thuyết

### 1.1 Data types (⭐⭐⭐)

- Dùng `<stdint.h>`: `uint8_t`, `uint16_t`, `uint32_t`, `int8_t`...
- **Tại sao:** kích thước `int` phụ thuộc kiến trúc; Embedded cần biết chính xác số byte.
- Overflow: `uint8_t x = 255; x++;` → `x = 0`.

### 1.2 Pointer (⭐⭐⭐⭐⭐)

```text
value   → giá trị
&value  → địa chỉ của value
ptr     → biến chứa địa chỉ
*ptr    → dữ liệu tại địa chỉ đó
```

- Pointer arithmetic: `ptr + 1` tăng theo `sizeof(*ptr)`, không phải +1 byte.
- Array name ≈ địa chỉ phần tử đầu tiên.
- Pass by pointer để function sửa được dữ liệu bên ngoài.
- **Liên hệ Embedded:** register thực chất là một địa chỉ bộ nhớ → truy cập bằng pointer.

### 1.3 Bitwise (⭐⭐⭐⭐⭐)

| Thao tác            | Code                     |
| -------------------- | ------------------------ |
| Set bit n            | `reg                     |
| Clear bit n          | `reg &= ~(1U << n);`   |
| Toggle bit n         | `reg ^= (1U << n);`    |
| Check bit n          | `if (reg & (1U << n))` |
| Ghi field nhiều bit | `reg = (reg & ~MASK)     |

**Liên hệ Embedded:** mỗi bit trong register điều khiển một chức năng phần cứng.

### 1.4 Struct, typedef, enum (⭐⭐⭐⭐⭐)

- `typedef struct { ... } Name;`
- `.` với biến, `->` với pointer.
- `enum` cho state, error code → nền tảng của **State Machine**.
- Xử lý lỗi bằng status code (không dùng exception):

```c
typedef enum { STATUS_OK, STATUS_ERROR, STATUS_TIMEOUT } Status;
```

### 1.5 Memory & keyword (⭐⭐⭐⭐⭐)

```text
Flash : .text (code), const data
RAM   : .data (global có khởi tạo)
        .bss  (global chưa khởi tạo → 0)
        heap  (malloc; Embedded hạn chế dùng)
        stack (local variable, function call)
```

| Keyword                     | Ý nghĩa                                                                          | Ví dụ Embedded                      |
| --------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| `const`                   | Không được sửa                                                                | Bảng tra cứu, lưu trong Flash      |
| `static` (trong function) | Giữ giá trị giữa các lần gọi                                                | Bộ đếm                             |
| `static` (global)         | Chỉ dùng trong file đó                                                         | Biến nội bộ của driver            |
| `volatile`                | Giá trị có thể đổi ngoài luồng code → compiler phải đọc lại mỗi lần | Register, biến dùng trong interrupt |

### 1.6 Module & C++ concept (⭐⭐⭐)

- `.h` = khai báo (interface), `.c` = cài đặt.
- Header guard: `#ifndef LED_H / #define LED_H / #endif`.
- C++: chỉ cần hiểu class, object, constructor, encapsulation, reference. Inheritance, polymorphism, template, exception: **nhận biết**.

## 2. Thực hành lab

> Mỗi lab 20–40 phút. Tự viết trước, chỉ xem gợi ý khi bí.

**Lab 0.1: Types & Overflow**

- In `sizeof` của `char, int, long, uint8_t, uint32_t, float, pointer`.
- Thử overflow `uint8_t` và `int8_t`. Giải thích kết quả.

**Lab 0.2: Pointer**

1. Viết `void swap(int *a, int *b)`.
2. Duyệt mảng `uint8_t buffer[8]` bằng pointer (không dùng `[]`).
3. In địa chỉ từng phần tử của `uint8_t[]` và `uint32_t[]`, giải thích khoảng cách địa chỉ.
4. Viết `uint16_t average(const uint16_t *data, uint8_t len)`.

**Lab 0.3: Bit Manipulation**

- Viết macro: `SET_BIT, CLEAR_BIT, TOGGLE_BIT, READ_BIT`.
- Viết `void print_binary(uint8_t v)`.
- Bài tập: biến `uint8_t reg = 0x00`
  - Set bit 0, 3, 7 → kết quả phải là `0x89`
  - Toggle bit 3 → `0x81`
  - Ghi giá trị `0b101` vào bit [6:4] mà không ảnh hưởng bit khác.

**Lab 0.4: Struct & Enum**

- Tạo `SensorData { uint16_t temperature; uint8_t humidity; Status status; }`.
- Viết `void sensor_update(SensorData *s, uint16_t t, uint8_t h)` dùng `->`.
- Tạo mảng 5 sensor, tìm sensor có nhiệt độ cao nhất.
- In `sizeof(SensorData)` và giải thích tại sao có thể lớn hơn tổng các field (padding).

**Lab 0.5: static / const / volatile**

- Viết `uint32_t get_tick(void)` dùng `static` counter.
- Tạo `const uint16_t lookup[] = {...}`, thử sửa → đọc lỗi compiler.
- Đọc và giải thích: tại sao vòng lặp `while (flag == 0) {}` có thể bị lặp vô hạn khi build `-O2` nếu `flag` được ISR thay đổi mà không có `volatile`.

## 3. Project Day 0: Embedded Device Simulator

### Mô tả

Mô phỏng một thiết bị đo nhiệt độ chạy trên PC với **Super Loop**:

```text
Button (giả lập) ─┐
                  ├─> Application (State Machine) ─┬─> LED (bit trong biến register)
Sensor (giả lập) ─┘                                └─> UART (printf ra console)
```

### Yêu cầu chức năng

1. Sensor trả về nhiệt độ ngẫu nhiên 20–40°C mỗi chu kỳ.
2. State machine: `IDLE → MONITORING → ALARM`.
   - Nhấn button (gõ phím `b` hoặc theo chu kỳ giả lập) để chuyển IDLE ↔ MONITORING.
   - Nhiệt độ > 35°C → `ALARM`; < 33°C → về `MONITORING` (hysteresis).
3. LED mô phỏng bằng `uint8_t led_port`:
   - bit0 = LED xanh (MONITORING), bit1 = LED đỏ (ALARM).
4. "UART" in log mỗi chu kỳ: `[tick] state=..., temp=..., led=0b...`.
5. Lưu 10 mẫu gần nhất trong **ring buffer**, tính trung bình.

### Yêu cầu kỹ thuật (checklist)

- [ ] `stdint.h` types
- [ ] Pointer to struct cho tất cả hàm module
- [ ] Bitwise để điều khiển `led_port`
- [ ] `enum` cho state và status
- [ ] `static` cho biến nội bộ module
- [ ] `const` cho cấu hình ngưỡng
- [ ] `volatile` cho `button_flag`
- [ ] Ít nhất 4 module `.c/.h`
- [ ] Không dùng `malloc`

### Bonus (C++)

Refactor `led` thành `class Led` có `on()/off()/toggle()`, so sánh với bản C.

---

# DAY 1: Embedded System Mental Model

## Lịch học

| Thời gian   | Block                 | Nội dung                                                   |
| ------------ | --------------------- | ----------------------------------------------------------- |
| 08:00–09:00 | Lý thuyết 1         | Embedded System là gì, ví dụ thực tế                  |
| 09:00–10:00 | Lý thuyết 2         | MCU vs MPU vs CPU; kiến trúc MCU                          |
| 10:00–11:00 | Lab 1                 | Phân tích 3 thiết bị thực tế thành block diagram     |
| 11:00–12:00 | Lý thuyết 3         | Memory: Flash/SRAM/Register,**Memory map**            |
| 13:30–14:30 | Lý thuyết 4 + Lab 2 | **Memory-mapped register**: pointer + volatile        |
| 14:30–15:30 | Lý thuyết 5         | Boot flow, clock, firmware structure, toolchain             |
| 15:30–16:30 | Lab 3                 | Build pipeline:`.c → .o → .elf → .bin`, đọc `.map` |
| 16:30–17:00 | Lý thuyết 6         | Layer: Application → HAL/Driver → Register → Peripheral  |
| 19:00–21:30 | Project               | Virtual MCU                                                 |
| 21:30–22:00 | Review                | Giải thích lại hệ thống bằng lời + quiz              |

## 1. Lý thuyết

### 1.1 Embedded System

- Hệ thống máy tính **chuyên dụng**, nhúng trong một thiết bị, thường có ràng buộc: tài nguyên hạn chế, thời gian thực, tiết kiệm năng lượng, độ tin cậy cao.
- Ví dụ: máy giặt, khóa thông minh, cảm biến IoT, ECU ô tô.
- So với PC: không có (hoặc không cần) OS đầy đủ, chạy một nhiệm vụ cụ thể, tương tác trực tiếp với phần cứng.

### 1.2 MCU vs MPU vs CPU

|                | CPU          | MCU                                         | MPU                                       |
| -------------- | ------------ | ------------------------------------------- | ----------------------------------------- |
| Bản chất     | Lõi xử lý | CPU + Flash + RAM + Peripheral trên 1 chip | CPU mạnh, RAM/Flash thường bên ngoài |
| Thường chạy | —           | Bare-metal / RTOS                           | Linux                                     |
| Ví dụ dùng  | —           | Cảm biến, điều khiển                   | Gateway, thiết bị có màn hình        |

### 1.3 Kiến trúc MCU

```text
┌──────────────────────── MCU ────────────────────────┐
│  CPU Core ── Bus ──┬── Flash (code)                  │
│     │              ├── SRAM (data, stack)            │
│  Clock             ├── GPIO ──────────── Pin ── LED  │
│  Reset             ├── Timer                         │
│  Interrupt Ctrl    ├── UART/I2C/SPI ──── Pin ── Sensor│
│                    └── ADC / PWM                     │
└──────────────────────────────────────────────────────┘
```

### 1.4 Memory map & Register

- Mọi thứ (Flash, RAM, peripheral) đều nằm trong **một không gian địa chỉ**.
- Peripheral được điều khiển qua **register** tại địa chỉ cố định (tra trong reference manual; **địa chỉ cụ thể phụ thuộc từng MCU**).
- Pattern:

```c
#define REG32(addr)  (*(volatile uint32_t *)(addr))
```

- Đây là điểm nối trực tiếp kiến thức Day 0: **pointer + volatile + bitwise + struct**.

### 1.5 Boot flow & firmware structure

```text
Power on / Reset
  → Reset vector
  → Startup code (khởi tạo stack, copy .data, xóa .bss)
  → main()
      → init clock, peripheral
      → while(1) { read → process → output }
```

### 1.6 Toolchain

```text
.c/.h → Compiler → .o → Linker (+ linker script) → .elf → .bin/.hex → Flash vào MCU
```

- Cross-compiler: build trên PC, chạy trên MCU (ví dụ `arm-none-eabi-gcc` cho ARM Cortex-M).

### 1.7 Software layers

```text
Application        led_blink_task()
     ↓
Driver / HAL       led_on()
     ↓
Register           GPIO->ODR |= (1U << 5)
     ↓
Peripheral         GPIO port
     ↓
Electrical signal  Pin = 3.3V
     ↓
Physical device    LED sáng
```

## 2. Thực hành lab

**Lab 1.1: Phân tích thiết bị thực tế**
Chọn 3 thiết bị (máy giặt, khóa thông minh, cảm biến nhiệt IoT). Với mỗi thiết bị vẽ:

- Input (sensor/button) → MCU → Output (actuator/display/communication)
- Liệt kê peripheral có thể dùng.

**Lab 1.2: Memory-mapped register trên PC**

- Tạo mảng `static uint32_t fake_memory[64]` làm "vùng peripheral".
- Định nghĩa struct register:

```c
typedef struct {
    volatile uint32_t MODER;  // mode: input/output
    volatile uint32_t IDR;    // input data
    volatile uint32_t ODR;    // output data
} GPIO_TypeDef;
#define GPIOA ((GPIO_TypeDef *)&fake_memory[0])
```

- Set pin 5 output, bật/tắt bằng `GPIOA->ODR`, in giá trị binary.
- Lưu ý: tên register ở đây là mô phỏng, lấy cảm hứng từ kiểu đặt tên phổ biến; MCU thật phải tra reference manual.

**Lab 1.3: Build pipeline**

```bash
gcc -c main.c -o main.o
gcc main.o -o app -Wl,-Map=app.map
size app            # xem kích thước text/data/bss
nm app | head       # xem symbol
```

- Thêm biến global có/không khởi tạo, biến `const`, quan sát thay đổi `text/data/bss`.

**Lab 1.4 (tùy chọn): Simulator**

- Dùng trình mô phỏng online (ví dụ Wokwi) chạy ví dụ Blink trên một board phổ biến để thấy code → LED thật (ảo).

## 3. Project Day 1: Virtual MCU

### Mô tả

Nâng cấp project Day 0: thay `led_port` đơn giản bằng **MCU ảo có memory map và register**, tách đúng các layer.

```text
app/        Application (state machine Day 0)
   ↓
drivers/    led_driver, button_driver, uart_driver
   ↓
mcu/        virtual_mcu.h (memory map + register struct)
   ↓
hw_sim/     mô phỏng phần cứng: đọc ODR → in trạng thái LED,
            ghi IDR khi "nhấn button", UART DR → console
```

### Yêu cầu

1. Memory map ảo: GPIOA, GPIOB, UART1, TIMER (mỗi peripheral một struct register).
2. Driver **chỉ** được thao tác register, không gọi `printf` trực tiếp.
3. `hw_sim` đóng vai phần cứng: sau mỗi chu kỳ đọc register và hiển thị.
4. UART: driver ghi từng byte vào `UART1->DR`, `hw_sim` in ký tự ra console.
5. TIMER: `hw_sim` tăng `TIMER->CNT` mỗi chu kỳ; application dùng để tạo delay **non-blocking**.
6. Viết `docs/architecture.md` vẽ layer và data flow.

### Tiêu chí hoàn thành

- [ ] Application không biết register tồn tại (chỉ gọi driver)
- [ ] Đổi pin LED chỉ cần sửa 1 dòng config
- [ ] Giải thích được bằng lời: "Khi gọi `led_on()`, điều gì xảy ra đến tận LED?"
- [ ] Vẽ được memory map của MCU ảo

---

# README: Hướng dẫn triển khai

## Yêu cầu môi trường

| Công cụ          | Ghi chú                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| GCC                | Windows: MinGW-w64 hoặc WSL; macOS: Xcode CLT; Linux:`build-essential` |
| make               | Build tự động                                                          |
| VS Code            | Extension C/C++                                                           |
| Git                | Quản lý phiên bản theo từng lab                                      |
| (Tùy chọn) Wokwi | Mô phỏng board online, Day 1                                            |

Kiểm tra:

```bash
gcc --version
make --version
```

## Cấu trúc repository

```text
embedded-bootcamp/
├── README.md
├── day0/
│   ├── labs/
│   │   ├── lab01_types.c
│   │   ├── lab02_pointer.c
│   │   ├── lab03_bitwise.c
│   │   ├── lab04_struct.c
│   │   └── lab05_keywords.c
│   └── project/
│       ├── Makefile
│       ├── inc/   (sensor.h, led.h, uart.h, app.h, ring_buffer.h, config.h)
│       └── src/   (main.c, sensor.c, led.c, uart.c, app.c, ring_buffer.c)
├── day1/
│   ├── labs/
│   │   ├── lab01_devices.md
│   │   ├── lab02_mmio.c
│   │   └── lab03_build/
│   └── project/
│       ├── Makefile
│       ├── app/ drivers/ mcu/ hw_sim/
│       ├── main.c
│       └── docs/architecture.md
└── notes/
    ├── day0_review.md
    └── day1_review.md
```

## Makefile mẫu (dùng cho cả 2 project)

```makefile
CC      = gcc
CFLAGS  = -Wall -Wextra -std=c11 -O0 -g -Iinc
SRC     = $(wildcard src/*.c)
OBJ     = $(SRC:.c=.o)
TARGET  = device_sim

all: $(TARGET)
$(TARGET): $(OBJ)
	$(CC) $(OBJ) -o $@ -Wl,-Map=$(TARGET).map
%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@
run: all
	./$(TARGET)
clean:
	rm -f src/*.o $(TARGET) $(TARGET).map
```

> Day 1: sửa `SRC` và `-I` để bao gồm `app/ drivers/ mcu/ hw_sim/`.

## Quy trình triển khai

1. **Setup** (15 phút): cài công cụ, tạo repo, commit cấu trúc rỗng.
2. **Labs:** mỗi lab một file, build nhanh: `gcc -Wall -Wextra lab02_pointer.c -o lab02 && ./lab02`. Commit sau mỗi lab: `git commit -m "day0: lab02 pointer"`.
3. **Project:** làm theo thứ tự
   `config.h → led → sensor → uart → ring_buffer → app (state machine) → main`.
   Build và chạy sau mỗi module, không viết tất cả rồi mới build.
4. **Day 1:** copy project Day 0 sang `day1/project`, thêm `mcu/` và `hw_sim/`, sau đó refactor driver sang dùng register.
5. **Review:** ghi vào `notes/dayX_review.md`: đã hiểu, chưa chắc, câu hỏi cho coach.

## Definition of Done

| Day   | Điều kiện                                                                                                                                    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Day 0 | Build không warning với`-Wall -Wextra`; chạy đủ 3 state; giải thích được pointer, bitwise, volatile bằng ví dụ của chính mình |
| Day 1 | Application tách biệt khỏi register; vẽ được memory map + layer; giải thích được luồng`led_on()` → LED                          |

## Self-check quiz cuối ngày

**Day 0**

1. `*ptr` và `&value` khác nhau thế nào?
2. Viết lệnh clear bit 4 của `reg`.
3. Khi nào bắt buộc dùng `volatile`?
4. Biến local nằm ở vùng nhớ nào? Global chưa khởi tạo nằm ở đâu?
5. Tại sao Embedded hạn chế dùng `malloc`?

**Day 1**

1. MCU khác MPU ở điểm nào?
2. Code nằm ở Flash hay RAM? Stack nằm ở đâu?
3. Memory-mapped register là gì?
4. Điều gì xảy ra từ lúc cấp nguồn đến khi vào `main()`?
5. Tại sao cần tách lớp Driver/HAL khỏi Application?

## Prompt dùng với Embedded System Coach

```text
Start Day 0. Tôi đang ở Lab 0.2 Pointer. Kiểm tra code sau và chỉ ra lỗi, chưa đưa đáp án ngay.
Review project Day 0 của tôi theo checklist kỹ thuật.
Start Day 1. Giải thích memory-mapped register bằng ví dụ project Virtual MCU.
Hỏi tôi 5 câu self-check Day 1 và đánh giá câu trả lời.
```
