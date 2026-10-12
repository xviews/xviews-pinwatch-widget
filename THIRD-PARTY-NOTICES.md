# Third-party notices / Hinweise zu Dritten

## WireView Pro II USB protocol / USB-Protokoll des WireView Pro II

The bridge is an independent implementation in C#. No code from the sources below is included. It only uses
read-only commands.

Die Bridge ist eine eigene Implementierung in C#. Aus den unten genannten Quellen ist kein Code enthalten. Sie nutzt
ausschließlich lesende Befehle.

### WireViewPro2-Python (ElmorLabs / Thermal Grizzly), MIT License

https://github.com/ElmorLabs-ThermalGrizzly/WireViewPro2-Python

Official sample code, Copyright (c) 2026 ElmorLabs-ThermalGrizzly, published under the MIT License. It documents the
command numbers, the layout of the sensor values, the fault bits, the device information and the vendor ID check
(EF/05) that the bridge also uses.

Offizieller Beispielcode unter MIT-Lizenz. Er beschreibt Befehlsnummern, Aufbau der Sensorwerte, Fehler-Bits,
Geräteinformationen und die Prüfung der Herstellerkennung (EF/05), die auch die Bridge verwendet.

### WireViewDeviceLib (ElmorLabs / Thermal Grizzly)

https://github.com/ElmorLabs-ThermalGrizzly/WireViewDeviceLib

Publicly viewable library without a stated license. Only the layout of the device configuration (protection limits
and fan curve, read-only) was worked out from it.

Öffentlich einsehbare Bibliothek ohne angegebene Lizenz. Daraus wurde nur der Aufbau der Gerätekonfiguration
nachvollzogen (Schutzgrenzen und Lüfterkurve, nur lesend).

## NVIDIA nvidia-smi

GPU values are read by calling `nvidia-smi`, which is installed with the NVIDIA graphics driver. It is not shipped
with this project.

GPU-Werte werden über `nvidia-smi` gelesen, das mit dem NVIDIA-Grafiktreiber installiert wird. Es ist nicht Teil
dieses Projekts.

## Microsoft .NET

The bridge runs on the .NET Desktop Runtime, which is not shipped with this project.

Die Bridge läuft auf der .NET Desktop Runtime, die nicht mitgeliefert wird.

## Trademarks / Marken

Thermal Grizzly, WireView, CORSAIR, iCUE, VANGUARD, NVIDIA and all other product and company names are trademarks
of their respective owners. They are used here only to describe which hardware and software this project works with.
This project is not affiliated with, endorsed or supported by any of these companies.

Die genannten Marken gehören ihren jeweiligen Inhabern und werden nur verwendet, um zu beschreiben, mit welcher
Hardware und Software dieses Projekt zusammenarbeitet. Es besteht keine Verbindung zu diesen Unternehmen.
