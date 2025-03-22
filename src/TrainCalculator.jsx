import { useState } from "react"
import { format, addMinutes } from "date-fns"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Clock, Gauge, ArrowRightLeftIcon as ArrowsRightLeft } from "lucide-react"

export default function TrainCalculator() {
  const [distance, setDistance] = useState(200)

  const [trainA, setTrainA] = useState({
    departureTime: "08:00",
    speed: 80,
  })

  const [trainB, setTrainB] = useState({
    departureTime: "08:00",
    speed: 100,
  })

  const [result, setResult] = useState({
    meetingTimeHours: null,
    meetingActualTime: null,
    trainADistance: null,
    trainBDistance: null,
    meetingPoint: null,
  })

  const [calculated, setCalculated] = useState(false)

  const handleTrainAChange = (e) => {
    const { name, value } = e.target
    setTrainA({
      ...trainA,
      [name]: name === "departureTime" ? value : Number(value),
    })
    setCalculated(false)
  }

  const handleTrainBChange = (e) => {
    const { name, value } = e.target
    setTrainB({
      ...trainB,
      [name]: name === "departureTime" ? value : Number(value),
    })
    setCalculated(false)
  }

  const handleDistanceChange = (e) => {
    setDistance(Number(e.target.value))
    setCalculated(false)
  }

  const calculateMeeting = () => {
    const timeAToMinutes = convertTimeToMinutes(trainA.departureTime)
    const timeBToMinutes = convertTimeToMinutes(trainB.departureTime)

    const timeDiffHours = (timeBToMinutes - timeAToMinutes) / 60

    let meetingTimeHours
    let trainATimeInMotion
    let trainBTimeInMotion

    if (timeAToMinutes === timeBToMinutes) {
      meetingTimeHours = distance / (trainA.speed + trainB.speed)
      trainATimeInMotion = meetingTimeHours
      trainBTimeInMotion = meetingTimeHours
    } else {
      if (timeAToMinutes < timeBToMinutes) {
        const headStartHours = timeDiffHours
        const distanceTraveledByA = trainA.speed * headStartHours

        if (distanceTraveledByA >= distance) {
          setResult({
            meetingTimeHours: null,
            meetingActualTime: "No se encuentran",
            trainADistance: distance,
            trainBDistance: 0,
            meetingPoint: null,
            chartData: [],
          })
          setCalculated(true)
          return
        }

        const remainingDistance = distance - distanceTraveledByA
        const timeAfterBStarts = remainingDistance / (trainA.speed + trainB.speed)

        meetingTimeHours = headStartHours + timeAfterBStarts
        trainATimeInMotion = meetingTimeHours
        trainBTimeInMotion = timeAfterBStarts
      } else {
        const headStartHours = -timeDiffHours
        const distanceTraveledByB = trainB.speed * headStartHours

        if (distanceTraveledByB >= distance) {
          setResult({
            meetingTimeHours: null,
            meetingActualTime: "No se encuentran",
            trainADistance: 0,
            trainBDistance: distance,
            meetingPoint: null,
            chartData: [],
          })
          setCalculated(true)
          return
        }

        const remainingDistance = distance - distanceTraveledByB
        const timeAfterAStarts = remainingDistance / (trainA.speed + trainB.speed)

        meetingTimeHours = headStartHours + timeAfterAStarts
        trainATimeInMotion = timeAfterAStarts
        trainBTimeInMotion = meetingTimeHours
      }
    }

    const earliestDepartureMinutes = Math.min(timeAToMinutes, timeBToMinutes)
    const meetingTimeMinutes = earliestDepartureMinutes + meetingTimeHours * 60
    const meetingActualTime = format(addMinutes(new Date().setHours(0, 0, 0, 0), meetingTimeMinutes), "HH:mm")

    const trainADistance = trainA.speed * trainATimeInMotion
    const trainBDistance = trainB.speed * trainBTimeInMotion

    const meetingPoint = trainA.speed * trainATimeInMotion

    setResult({
      meetingTimeHours,
      meetingActualTime,
      trainADistance,
      trainBDistance,
      meetingPoint,
    })

    setCalculated(true)
  }

  const convertTimeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours * 60 + minutes
  }

  const formatHours = (hours) => {
    if (hours === null) return "N/A"
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Calculadora de Encuentro de Trenes</h1>

      <Card className="p-6 shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ArrowsRightLeft className="h-5 w-5 mr-2" />
          Distancia entre ciudades
        </h2>
        <div className="gap-4 items-end">
          <div>
            <Label htmlFor="distance">Distancia (km)</Label>
            <Input id="distance" type="number" value={distance} onChange={handleDistanceChange} className="mt-1" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Train A inputs */}
        <Card className="p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Tren
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mr-2">
              A
            </div>
          </h2>
          <div className="space-y-5">
            <div>
              <Label htmlFor="trainA-departureTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Hora de salida
              </Label>
              <Input
                id="trainA-departureTime"
                name="departureTime"
                type="time"
                value={trainA.departureTime}
                onChange={handleTrainAChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="trainA-speed" className="flex items-center gap-2">
                <Gauge className="h-4 w-4" /> Velocidad (km/h)
              </Label>
              <div className="flex gap-4 items-center mt-1">
                <Slider
                  id="trainA-speed"
                  name="speed"
                  min={10}
                  max={300}
                  step={5}
                  value={[trainA.speed]}
                  onValueChange={(value) => {
                    setTrainA({ ...trainA, speed: value[0] })
                    setCalculated(false)
                  }}
                  className="flex-1"
                />
                <Input type="number" value={trainA.speed} onChange={handleTrainAChange} name="speed" className="w-20" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Tren
            <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center mr-2">
              B
            </div>
            
          </h2>
          <div className="space-y-5">
            <div>
              <Label htmlFor="trainB-departureTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Hora de salida
              </Label>
              <Input
                id="trainB-departureTime"
                name="departureTime"
                type="time"
                value={trainB.departureTime}
                onChange={handleTrainBChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="trainB-speed" className="flex items-center gap-2">
                <Gauge className="h-4 w-4" /> Velocidad (km/h)
              </Label>
              <div className="flex gap-4 items-center mt-1">
                <Slider
                  id="trainB-speed"
                  name="speed"
                  min={10}
                  max={300}
                  step={5}
                  value={[trainB.speed]}
                  onValueChange={(value) => {
                    setTrainB({ ...trainB, speed: value[0] })
                    setCalculated(false)
                  }}
                  className="flex-1"
                />
                <Input type="number" value={trainB.speed} onChange={handleTrainBChange} name="speed" className="w-20" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <Button onClick={calculateMeeting} size="lg" variant="default" className="w-full md:w-auto hover:cursor-pointer">
          Calcular Encuentro
        </Button>
      </div>

      {calculated && (
        <Card className="mt-8 p-6 shadow-md">
          <h2 className="text-2xl font-semibold text-center">Resultados</h2>

          {result.meetingPoint !== null ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium text-muted-foreground mb-1">Tiempo hasta encuentro</p>
                  <p className="text-2xl font-bold">{formatHours(result.meetingTimeHours)}</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium text-muted-foreground mb-1">Hora de encuentro</p>
                  <p className="text-2xl font-bold">{result.meetingActualTime}</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="font-medium text-muted-foreground mb-1">Punto de encuentro</p>
                  <p className="text-2xl font-bold">{result.meetingPoint?.toFixed(2)} km</p>
                  <p className="text-sm text-muted-foreground">desde A</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center mr-2 text-xs">
                      A
                    </div>
                    <h3 className="font-semibold">Tren desde A</h3>
                  </div>
                  <p className="mb-1">
                    Distancia recorrida: <span className="font-semibold">{result.trainADistance?.toFixed(2)} km</span>
                  </p>
                  <p>
                    Tiempo en movimiento:{" "}
                    <span className="font-semibold">{formatHours(result.trainADistance / trainA.speed)}</span>
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center mr-2 text-xs">
                      B
                    </div>
                    <h3 className="font-semibold">Tren desde B</h3>
                  </div>
                  <p className="mb-1">
                    Distancia recorrida: <span className="font-semibold">{result.trainBDistance?.toFixed(2)} km</span>
                  </p>
                  <p>
                    Tiempo en movimiento:{" "}
                    <span className="font-semibold">{formatHours(result.trainBDistance / trainB.speed)}</span>
                  </p>
                </div>
              </div>

            </>
          ) : (
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold text-destructive mb-2">Los trenes no se encontrarán</h3>
              <p className="text-muted-foreground">
                Con la configuración actual, los trenes no llegarán a encontrarse. Esto puede deberse a que:
              </p>
              <ul className="list-disc text-left max-w-md mx-auto mt-4 space-y-2">
                <li>Uno de los trenes ya completó todo el recorrido antes de que el otro saliera</li>
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

