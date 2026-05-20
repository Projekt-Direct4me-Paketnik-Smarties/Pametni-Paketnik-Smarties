import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.lanteam.bookbox.model.PacketBox
import org.osmdroid.tileprovider.tilesource.TileSourceFactory
import org.osmdroid.util.GeoPoint
import org.osmdroid.views.MapView
import org.osmdroid.views.overlay.Marker
import com.lanteam.bookbox.R

@Composable
fun OsmMapView(
    modifier: Modifier = Modifier,
    packetBoxes: List<PacketBox> = emptyList(),
    startLocation: GeoPoint
) {
    val context = LocalContext.current

    val mapView = remember {
        MapView(context).apply {
            setTileSource(TileSourceFactory.MAPNIK)
            setMultiTouchControls(true)
            controller.setZoom(17.0)

            packetBoxes.forEach { box ->
                val marker = Marker(this).apply {
                    position = box.location.toGeoPoint()
                    title = box.name
                    icon = ContextCompat.getDrawable(context, R.drawable.marker)
                    setAnchor(Marker.ANCHOR_CENTER, Marker.ANCHOR_BOTTOM)
                }
                overlays.add(marker)
            }
        }
    }
    // Re-center when startLocation changes
    LaunchedEffect(startLocation) { // this cuz we got a default location and then another when user permisons are set
        mapView.controller.setCenter(startLocation)
    }

    DisposableEffect(Unit) { // this is basicaly like onResume and onPause, but composable doest have that so we use this. the map state still resets every time, should keep info on last location in a stateholder
        mapView.onResume()
        onDispose { mapView.onPause() }
    }

    AndroidView(factory = { mapView }, modifier = modifier)
}