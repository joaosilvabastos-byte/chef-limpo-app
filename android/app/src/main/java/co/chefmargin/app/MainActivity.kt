package co.chefmargin.app

import android.os.Bundle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // Inicializa o splash screen da API 12+ (Android 12+)
        installSplashScreen()
        super.onCreate(savedInstanceState)
    }
}
