const MAX_POWER_WATTS = 2500;

const devices = [
    {
        id: "DEV_001",
        name: "Den phong khach",
        room: "Phong khach",
        category: "light",
        powerWatts: 20,
        isActive: false,
        connected: true
    },
    {
        id: "DEV_002",
        name: "May pha ca phe",
        room: "Phong bep",
        category: "appliance",
        powerWatts: 1200,
        isActive: false,
        connected: true
    },
    {
        id: "DEV_003",
        name: "Dieu hoa",
        room: "Phong ngu",
        category: "highPower",
        powerWatts: 1800,
        isActive: false,
        connected: true
    },
    {
        id: "DEV_004",
        name: "Den ngu",
        room: "Phong ngu",
        category: "light",
        powerWatts: 10,
        isActive: false,
        connected: true
    }
];

// 1. Kiem chuan du lieu thiet bi
const validateDevice = (dev) => {
    if (dev === null || typeof dev !== "object") {
        return false;
    }

    if (typeof dev.name !== "string" || dev.name.trim() === "") {
        return false;
    }

    if (typeof dev.room !== "string" || dev.room.trim() === "") {
        return false;
    }

    if (
        typeof dev.powerWatts !== "number" ||
        !Number.isFinite(dev.powerWatts) ||
        dev.powerWatts <= 0
    ) {
        return false;
    }

    if (
        dev.isActive !== undefined &&
        typeof dev.isActive !== "boolean"
    ) {
        return false;
    }

    if (
        dev.connected !== undefined &&
        typeof dev.connected !== "boolean"
    ) {
        return false;
    }

    return true;
};

// 2. Tim thiet bi theo ID
const findDeviceById = (list, id) => {
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            return list[i];
        }
    }

    return null;
};

// 3. CREATE: Them thiet bi moi
const createDevice = (list, dev) => {
    if (!validateDevice(dev)) {
        console.log("Tu choi them: du lieu khong hop le.");
        return null;
    }

    let maxId = 0;

    for (let i = 0; i < list.length; i++) {
        const numberPart = Number(
            list[i].id.replace("DEV_", "")
        );

        if (Number.isInteger(numberPart) && numberPart > maxId) {
            maxId = numberPart;
        }
    }

    const newDevice = {
        id: "DEV_" + String(maxId + 1).padStart(3, "0"),
        name: dev.name.trim(),
        room: dev.room.trim(),
        category: dev.category || "appliance",
        powerWatts: dev.powerWatts,
        isActive: dev.isActive === undefined ? false : dev.isActive,
        connected: dev.connected === undefined ? true : dev.connected
    };

    list.push(newDevice);

    console.log("Da them thiet bi:", newDevice.id);
    return newDevice;
};

// 4. UPDATE: Cap nhat trang thai an toan
const updateDevice = (list, id, updateData) => {
    const device = findDeviceById(list, id);

    if (device === null) {
        console.log("Khong tim thay thiet bi:", id);
        return false;
    }

    if (updateData === null || typeof updateData !== "object") {
        return false;
    }

    if (
        updateData.isActive !== undefined &&
        typeof updateData.isActive !== "boolean"
    ) {
        return false;
    }

    if (
        updateData.powerWatts !== undefined &&
        (typeof updateData.powerWatts !== "number" ||
            !Number.isFinite(updateData.powerWatts) ||
            updateData.powerWatts < 0)
    ) {
        return false;
    }

    // Khong dieu khien thiet bi mat ket noi
    if (device.connected === false) {
        console.log("Thiet bi mat ket noi:", id);
        return false;
    }

    if (updateData.isActive !== undefined) {
        device.isActive = updateData.isActive;
    }

    if (updateData.powerWatts !== undefined) {
        device.powerWatts = updateData.powerWatts;
    }

    return true;
};

// 5. DELETE: Xoa thiet bi theo ID
const deleteDevice = (list, id) => {
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            list.splice(i, 1);
            console.log("Da xoa thiet bi:", id);
            return true;
        }
    }

    console.log("Khong tim thay ID de xoa:", id);
    return false;
};

// 6. READ: In danh sach thiet bi
const readDevices = (list) => {
    console.table(list);
    return list;
};

// 7. Tinh tong cong suat thiet bi dang bat
const calculateEnergy = (list) => {
    return list.reduce((total, device) => {
        if (device.isActive) {
            return total + device.powerWatts;
        }

        return total;
    }, 0);
};

// 8. Ngat bot thiet bi neu vuot nguong cong suat
const enforcePowerLimit = (list) => {
    let totalPower = calculateEnergy(list);

    while (totalPower > MAX_POWER_WATTS) {
        let deviceToTurnOff = null;

        // Tim thiet bi dang bat co cong suat lon nhat
        for (let i = 0; i < list.length; i++) {
            const device = list[i];

            if (
                device.isActive &&
                device.connected &&
                (
                    deviceToTurnOff === null ||
                    device.powerWatts > deviceToTurnOff.powerWatts
                )
            ) {
                deviceToTurnOff = device;
            }
        }

        // Khong con thiet bi nao co the ngat
        if (deviceToTurnOff === null) {
            console.log(
                "CANH BAO: Vuot nguong nhung khong the ngat them thiet bi."
            );
            return false;
        }

        deviceToTurnOff.isActive = false;

        console.log(
            "Tu dong ngat:",
            deviceToTurnOff.name,
            "-",
            deviceToTurnOff.powerWatts,
            "W"
        );

        totalPower = calculateEnergy(list);
    }

    return true;
};

// 9. Dispatcher: Dieu phoi cac ngu canh
const triggerScene = (list, sceneName) => {
    const scenes = {
        GoodMorning: {
            "DEV_001": true,
            "DEV_002": true,
            "DEV_003": false,
            "DEV_004": false
        },

        LeaveHome: {
            "DEV_001": false,
            "DEV_002": false,
            "DEV_003": false,
            "DEV_004": false
        },

        SleepMode: {
            "DEV_001": false,
            "DEV_002": false,
            "DEV_003": false,
            "DEV_004": true
        }
    };

    if (scenes[sceneName] === undefined) {
        console.log("Ngu canh khong ton tai:", sceneName);
        return false;
    }

    console.log("\nDang kich hoat ngu canh:", sceneName);

    const scene = scenes[sceneName];

    for (let i = 0; i < list.length; i++) {
        const device = list[i];

        // Chi cap nhat neu ngu canh co quy dinh ID nay
        if (scene[device.id] !== undefined) {
            const success = updateDevice(
                list,
                device.id,
                { isActive: scene[device.id] }
            );

            if (!success) {
                console.log(
                    "Bo qua thiet bi khong dieu khien duoc:",
                    device.id
                );
            }
        }
    }

    // Kiem tra va xu ly qua tai sau khi ap dung ngu canh
    enforcePowerLimit(list);

    console.log("Tong cong suat:", calculateEnergy(list), "W");
    console.log("Trang thai sau ngu canh:");
    console.table(list);

    return true;
};

